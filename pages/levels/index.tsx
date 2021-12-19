import React from 'react';
import { NextPage } from 'next';
import InputField from '@components/InputField';
import Image from 'next/image';
import SearchIcon from '@assets/icons/search.svg';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import FilterIcon from '@assets/icons/filter.svg';
import SortIcon from '@assets/icons/sort.svg';
import TagIcon from '@assets/icons/tag.svg';
import ResetIcon from '@assets/icons/reset.svg';
import { useForm, UseFormReturn } from 'react-hook-form';
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion';
import infoIcon from '@assets/icons/info.svg';
import dynamic from 'next/dynamic';
import ascIcon from '@assets/icons/ascIcon.svg';
import descIcon from '@assets/icons/descIcon.svg';
import difficultyIcon from '@assets/icons/difficulty.svg';
import dateIcon from '@assets/icons/date.svg';
import likesIcon from '@assets/icons/like.svg';
import { api } from '../../utils/api';
import { ApiListResult, Level } from '../../typings';
import { Virtuoso } from 'react-virtuoso';
import LevelListItem from '@components/Level/LevelListItem';
const ReactTooltip = dynamic(() => import('react-tooltip'), { ssr: false });

const TabItemContainer = styled.div`
  position: relative;
  cursor: pointer;
  padding: 6px 8px;
  min-width: 69px;
  opacity: 0.8;
  display: flex;
  gap: 6px;
  font-size: 16px;
  letter-spacing: -0.031em;
  line-height: 10px;
  font-weight: normal;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
  transition-property: background-color, opacity;

  &:hover,
  &:focus {
    opacity: 1;
  }
`;

type Tag = {
  id: number | string;
  name: string;
  icon?: string;
  default?: boolean;
};

const ChartTags: Tag[] = [
  { id: 20, name: 'subjective' },
  { id: 13, name: 'pseudo' },
  { id: 15, name: 'pseudo2' },
  { id: 14, name: 'gallop' },
  { id: 8, name: 'magicShape' },
  { id: 5, name: 'memorization' },
  { id: 3, name: 'noSpeedChange' },
  { id: 6, name: 'noTwirls' }
];

const RhythmTags: Tag[] = [
  { id: 2, name: 'triplet' },
  { id: 19, name: 'quintuplet' },
  { id: 9, name: 'septuplet' },
  { id: 18, name: 'polyrhythm' },
  { id: 16, name: 'swing' },
  { id: 21, name: 'tresillo' },
  { id: 12, name: 'funkyBeat' },
  { id: 10, name: '64Beat' },
  { id: 7, name: 'accDec' },
  { id: 17, name: 'slow' }
];

const LengthTags: Tag[] = [
  { id: 'length-short', name: 'short' },
  { id: 'length-medium', name: 'medium' },
  { id: 'length-long', name: 'long' }
];

type TabItemProps = {
  icon: string;
  active: boolean;
  isResetButton?: boolean;
} & React.HTMLProps<any>;

const TabItem: React.FC<TabItemProps> = ({
  icon,
  active,
  isResetButton = false,
  children,
  onClick
}) => (
  <TabItemContainer onClick={onClick} onDragStart={(e) => e.preventDefault()}>
    <AnimatePresence>
      {(active || isResetButton) && (
        <motion.div
          key='tab-bg'
          layoutId={isResetButton ? undefined : 'tab-item'}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: isResetButton ? undefined : 'rgba(2565, 255, 255, 0.2)',
            border: isResetButton
              ? '1.5px solid rgba(255, 255, 255, 0.4)'
              : undefined,
            borderRadius: 5
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1 }
          }}
          initial='hidden'
          animate='show'
          exit='hidden'
        />
      )}
    </AnimatePresence>
    <Image src={icon} width={11} height={11} alt='' />
    <div>{children}</div>
  </TabItemContainer>
);

enum SearchSettingTabType {
  NONE,
  TAGS,
  META,
  SORT
}

const TabContentContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const MetaInput: React.FC<{ label: string; input: React.ReactNode }> = ({
  label,
  input
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontWeight: 400, opacity: 0.8 }}>{label}</div>
      {input}
    </div>
  );
};

const TabContentGroup: React.FC<{
  title: React.ReactNode;
  help?: React.ReactNode;
}> = ({ title, children, help }) => {
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          paddingBottom: 12,
          fontSize: 16,
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          width: '100%',
          display: 'flex',
          gap: 12
        }}
      >
        {title}
        {help && (
          <>
            <div data-tip={help} style={{ opacity: 0.6 }}>
              <Image
                alt=''
                onDragStart={(e) => e.preventDefault()}
                src={infoIcon}
                width={12}
                height={12}
              />
            </div>
            <ReactTooltip />
          </>
        )}
      </div>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
};

const TabCheckboxContent = styled.div`
  display: flex;
  gap: 6px;
  opacity: 0.6;
  transition: opacity 0.2s ease;
`;

const TabCheckboxContainer = styled.label`
  align-items: center;
  cursor: pointer;

  input:checked + ${TabCheckboxContent} {
    opacity: 1;
  }
  input {
    display: none;
  }
`;

const TagCheckbox: React.FC<{
  form: FormType;
  tag: Tag;
  radio?: boolean;
  inputName?: string;
  formKey?: 'tags' | 'length';
  uncheckable?: boolean;
}> = ({
  form,
  tag,
  radio,
  inputName = 'tags',
  formKey = 'tags',
  uncheckable
}) => {
  const getTagIcon = (id: string) => {
    try {
      return (
        <Image
          onDragStart={(e) => e.preventDefault()}
          alt=''
          src={require(`@assets/tagIcons/${id}.svg`).default.src}
          width={22}
          height={22}
        />
      );
    } catch (e) {
      return '';
    }
  };

  const register = form.register(formKey);

  const { t } = useTranslation(['tags', 'search']);

  return (
    <TabCheckboxContainer>
      <input
        {...register}
        onClick={() => {
          if (uncheckable && tag.id === form.getValues('length')) {
            form.setValue('length', '');
          }
        }}
        type={radio ? 'radio' : 'checkbox'}
        name={inputName || register.name}
        value={tag.id || ''}
        defaultChecked={tag.default}
      />
      <TabCheckboxContent>
        {getTagIcon(`${tag.id || tag.icon}`)}{' '}
        {t(`tags:level.${tag.name}` as any)}
      </TabCheckboxContent>
    </TabCheckboxContainer>
  );
};

const TagsTab: React.FC<{ form: FormType }> = ({ form }) => {
  const { t } = useTranslation('tags');

  return (
    <TabContentContainer style={{ display: 'flex' }}>
      <TabContentGroup title={t('search:tabs.tags.chart' as any)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ChartTags.map((x, i) => (
            <TagCheckbox form={form} key={i} tag={x} />
          ))}
        </div>
      </TabContentGroup>
      <TabContentGroup title={t('search:tabs.tags.rhythm' as any)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {RhythmTags.map((x, i) => (
            <TagCheckbox form={form} key={i} tag={x} />
          ))}
        </div>
      </TabContentGroup>
      <TabContentGroup title={t('search:tabs.tags.length' as any)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LengthTags.map((x, i) => (
            <TagCheckbox
              radio
              uncheckable
              formKey='length'
              inputName='length'
              form={form}
              key={i}
              tag={x}
            />
          ))}
        </div>
      </TabContentGroup>
    </TabContentContainer>
  );
};

const RangeInput: React.FC<{ min: React.ReactNode; max: React.ReactNode }> = ({
  min,
  max
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {min}
      <div style={{ fontSize: 18 }}>~</div>
      {max}
    </div>
  );
};

const MetaTab: React.FC<{ form: FormType }> = ({ form }) => {
  const { t } = useTranslation('search');

  return (
    <TabContentContainer>
      <TabContentGroup title={t('tabs.meta.author')} help={t('help.author')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MetaInput
            label={t('level:artist' as any)}
            input={
              <InputField
                {...form.register('artist')}
                placeholder={t('tabs.meta.placeholder.artist')}
              />
            }
          />
          <MetaInput
            label={t('level:creator' as any)}
            input={
              <InputField
                placeholder={t('tabs.meta.placeholder.creator')}
                {...form.register('creator')}
              />
            }
          />
        </div>
      </TabContentGroup>
      <TabContentGroup title={t('tabs.meta.meta')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MetaInput
            label={t('level:difficulty' as any)}
            input={
              <RangeInput
                min={
                  <InputField
                    type='number'
                    placeholder={t('common:min' as any, {
                      content: t('level:difficulty' as any)
                    })}
                    {...form.register('minLv')}
                  />
                }
                max={
                  <InputField
                    type='number'
                    placeholder={t('common:max' as any, {
                      content: t('level:difficulty' as any)
                    })}
                    {...form.register('maxLv')}
                  />
                }
              />
            }
          />
          <MetaInput
            label={t('level:tiles' as any)}
            input={
              <RangeInput
                min={
                  <InputField
                    type='number'
                    placeholder={t('common:min' as any, {
                      content: t('level:tiles' as any)
                    })}
                    {...form.register('minTiles')}
                  />
                }
                max={
                  <InputField
                    type='number'
                    placeholder={t('common:max' as any, {
                      content: t('level:tiles' as any)
                    })}
                    {...form.register('maxTiles')}
                  />
                }
              />
            }
          />
          <MetaInput
            label={t('level:bpm' as any)}
            input={
              <RangeInput
                min={
                  <InputField
                    type='number'
                    placeholder={t('common:min' as any, {
                      content: t('level:bpm' as any)
                    })}
                    {...form.register('minTiles')}
                  />
                }
                max={
                  <InputField
                    type='number'
                    placeholder={t('common:max' as any, {
                      content: t('level:bpm' as any)
                    })}
                    {...form.register('maxTiles')}
                  />
                }
              />
            }
          />
        </div>
      </TabContentGroup>
    </TabContentContainer>
  );
};

const SortRadioContent = styled.div`
  display: flex;
  gap: 12px;
  padding-right: 20px;
  min-width: 120px;
  font-size: 16px;
  letter-spacing: -0.011em;
  align-items: center;
  opacity: 0.6;
  transition: opacity 0.2s ease;
`;

const SortRadioContainer = styled.label`
  input {
    display: none;
  }

  display: flex;
  align-items: center;
  cursor: pointer;

  input:checked + ${SortRadioContent} {
    opacity: 1;
  }
`;

const SortRadio: React.FC<{
  name: 'sortOrder' | 'sortResource';
  icon: any;
  value: string;
  label: React.ReactNode;
  form: FormType;
}> = ({ name, form, label, value, icon }) => {
  return (
    <SortRadioContainer>
      <input type='radio' {...form.register(name)} value={value} />
      <SortRadioContent>
        <Image src={icon} alt='' />
        <span>{label}</span>
      </SortRadioContent>
    </SortRadioContainer>
  );
};

const SortTab: React.FC<{ form: FormType }> = ({ form }) => {
  return (
    <TabContentContainer>
      <TabContentGroup title='Sort By'>
        <div style={{ display: 'flex', gap: 12 }}>
          <SortRadio
            label='Asc'
            name='sortOrder'
            form={form}
            icon={ascIcon}
            value='ASC'
          />
          <SortRadio
            form={form}
            label='Desc'
            name='sortOrder'
            icon={descIcon}
            value='DESC'
          />
          <div
            style={{
              height: 25,
              width: 0,
              opacity: 0.4,
              border: '1px solid #fff',
              marginRight: 10
            }}
          />
          <SortRadio
            label='Created Date'
            name='sortResource'
            form={form}
            icon={dateIcon}
            value='RECENT'
          />
          <SortRadio
            label='Difficulty'
            name='sortResource'
            form={form}
            icon={difficultyIcon}
            value='DIFFICULTY'
          />
          <SortRadio
            label='Likes'
            name='sortResource'
            form={form}
            icon={likesIcon}
            value='LIKE'
          />
        </div>
      </TabContentGroup>
    </TabContentContainer>
  );
};

type FormProps = {
  tags: string[];
  query: string;
  length: string;
  artist: string;
  creator: string;
  minLv: string;
  maxLv: string;
  minTiles: string;
  maxTiles: string;
  minBpm: string;
  maxBpm: string;
  sortOrder: string;
  sortResource: string;
};

type FormType = UseFormReturn<FormProps>;

const TabContentAnimator: React.FC<{ identifier: string }> = ({
  children,
  identifier
}) => {
  return (
    <motion.div
      key={identifier}
      initial={{
        x: 10,
        opacity: 0
      }}
      animate={{
        x: 0,
        opacity: 1
      }}
      exit={{
        opacity: 0,
        x: 10
      }}
    >
      {children}
    </motion.div>
  );
};

const getSearchSettingParams = (offset: number, form: FormType) => {
  const p = new URLSearchParams();

  p.set('offset', `${offset}`);
  p.set('amount', '15');
  p.set(
    'sort',
    `${form.getValues('sortResource')}_${form.getValues('sortOrder')}`
  );
  p.set('query', form.getValues('query'));
  p.set('queryCreator', form.getValues('creator'));
  p.set('queryArtist', form.getValues('artist'));

  const tagsToInclude = form.getValues('tags');
  const tagsToExclude: string[] = [];

  switch (form.getValues('length')) {
    case 'length-short':
      tagsToInclude.push('1');
      break;
    case 'length-medium':
      tagsToExclude.push('1', '11');
      break;
    case 'length-long':
      tagsToInclude.push('11');
      break;
  }

  p.set('includeTags', tagsToInclude.toString());
  p.set('excludeTags', tagsToExclude.toString());

  p.set('minDifficulty', form.getValues('minLv') || '');
  p.set('maxDifficulty', form.getValues('maxLv') || '');
  p.set('minBpm', form.getValues('minBpm') || '');
  p.set('maxBpm', form.getValues('maxBpm') || '');
  p.set('minTiles', form.getValues('minTiles') || '');
  p.set('maxTiles', form.getValues('maxTiles') || '');

  // if minLv or maxLv is 0, turn on showNotVerified param
  if (form.getValues('minLv') === '0' || form.getValues('maxLv') === '0') {
    p.set('showNotVerified', 'true');
  }

  return p.toString();
};

const Levels: NextPage<{
  initialData: Level[];
}> = ({ initialData }) => {
  const { t } = useTranslation(['search', 'main']);

  const [tab, setTab] = React.useState<SearchSettingTabType>(
    SearchSettingTabType.NONE
  );

  const toggleTab = (type: SearchSettingTabType) => () => {
    if (tab === type) {
      setTab(SearchSettingTabType.NONE);
    } else {
      setTab(type);
    }
  };

  const form: FormType = useForm<FormProps>({
    defaultValues: {
      tags: [],
      query: '',
      length: '',
      artist: '',
      creator: '',
      sortOrder: 'ASC',
      sortResource: 'RECENT'
    }
  });

  React.useEffect(() => {
    const subscription = form.watch(async () => {
      const res = await fetchLevels(getSearchSettingParams(0, form));

      setData(res.results);
    });

    return () => subscription.unsubscribe();
  }, [form.watch, form]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        switch (tab) {
          case SearchSettingTabType.TAGS:
            setTab(() => SearchSettingTabType.META);
            break;
          case SearchSettingTabType.META:
            setTab(() => SearchSettingTabType.SORT);
            break;
          case SearchSettingTabType.SORT:
            setTab(() => SearchSettingTabType.TAGS);
            break;
        }
      }
    };

    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
  }, [tab, setTab]);

  const [data, setData] = React.useState<Level[]>([]);
  // Minecraft
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const fetchLevels = async (params: string): Promise<ApiListResult<Level>> => {
    const { data } = await api.get(`/levels?${params}`);
    return data;
  };

  const loadMore = React.useCallback(async () => {
    const res = await fetchLevels(
      getSearchSettingParams(data.length + 1, form)
    );
    setData([...data, ...res.results]);
  }, [data, form]);

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: 'flex', gap: 8 }}>
          <InputField
            containerProps={{
              style: {
                flexGrow: 1,
                width: 0
              }
            }}
            {...form.register('query')}
            inputType='home'
            leftIcon={
              <Image
                alt=''
                onDragStart={(e) => e.preventDefault()}
                src={SearchIcon}
                width={14.99}
                height={15.99}
              />
            }
            placeholder={t('main:searchPlaceholder')}
          />
        </div>
        <div>
          <AnimateSharedLayout>
            <AnimatePresence>
              <div
                style={{
                  marginTop: 6,
                  paddingLeft: 12,
                  paddingRight: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <TabItem
                  onClick={toggleTab(SearchSettingTabType.TAGS)}
                  active={tab === SearchSettingTabType.TAGS}
                  icon={TagIcon.src}
                >
                  {t('search:tabs.tags.title')}
                </TabItem>
                <TabItem
                  onClick={toggleTab(SearchSettingTabType.META)}
                  active={tab === SearchSettingTabType.META}
                  icon={FilterIcon.src}
                >
                  {t('search:tabs.meta.title')}
                </TabItem>
                <TabItem
                  onClick={toggleTab(SearchSettingTabType.SORT)}
                  active={tab === SearchSettingTabType.SORT}
                  icon={SortIcon.src}
                >
                  {t('search:tabs.sort.title')}
                </TabItem>
                <TabItem
                  active={false}
                  icon={ResetIcon.src}
                  isResetButton
                  onClick={() => {
                    form.reset();
                  }}
                >
                  {t('search:reset')}
                </TabItem>
                <AnimatePresence>
                  {tab === SearchSettingTabType.TAGS && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: 'tween'
                      }}
                      style={{ display: 'flex', gap: 12, alignItems: 'center' }}
                    >
                      <div
                        style={{
                          height: 2,
                          width: 9,
                          background: 'rgba(255,255,255,0.4)',
                          borderRadius: 1.5
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          opacity: 0.6
                        }}
                      >
                        <Image
                          alt=''
                          onDragStart={(e) => e.preventDefault()}
                          src={infoIcon}
                          width={12}
                          height={12}
                        />
                        <div
                          style={{
                            fontSize: 14,
                            letterSpacing: '-0.011em'
                          }}
                        >
                          {t('search:help.tags')}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatePresence>
          </AnimateSharedLayout>
        </div>
        <div
          style={{
            marginTop: 16,
            paddingLeft: 12,
            paddingRight: 12,
            paddingBottom: 10
          }}
        >
          {tab === SearchSettingTabType.TAGS && (
            <TabContentAnimator identifier='tags'>
              <TagsTab form={form} />
            </TabContentAnimator>
          )}
          {tab === SearchSettingTabType.META && (
            <TabContentAnimator identifier='meta'>
              <MetaTab form={form} />
            </TabContentAnimator>
          )}
          {tab === SearchSettingTabType.SORT && (
            <TabContentAnimator identifier='sort'>
              <SortTab form={form} />
            </TabContentAnimator>
          )}
        </div>
      </form>
      <Virtuoso
        useWindowScroll
        data={data}
        endReached={loadMore}
        style={{
          gap: 12
        }}
        itemContent={(i, item) => (
          <div key={i} style={{ paddingTop: i === 0 ? 0 : 12 }}>
            <LevelListItem level={item} />
          </div>
        )}
      />
    </div>
  );
};

Levels.getInitialProps = async () => {
  const { data } = await api.get<ApiListResult<Level>>(
    '/levels?offset=0&sort=RECENT_ASC&amount=15'
  );

  return {
    initialData: data.results
  };
};

export default Levels;
