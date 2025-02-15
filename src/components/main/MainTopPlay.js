import { get } from '../../utils/http';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MainTopPlay = ({ topPlay }) => {
  const [difficulty, getDifficulty] = useState([]);

  const difficultyColorDict = {
    0: { borderColor: '#A4A4A4' },
    1: { borderColor: '#0099FF' },
    2: { borderColor: '#AEAFAD' },
    3: { borderColor: '#00DDFF' },
    4: { borderColor: '#00FFFF' },
    5: { borderColor: '#00FFAA' },
    6: { borderColor: '#00FF00' },
    7: { borderColor: '#66FF00' },
    8: { borderColor: '#99FF00' },
    9: { borderColor: '#CCFF00' },
    10: { borderColor: '#FFFF00' },
    11: { borderColor: '#FFDD00' },
    12: { borderColor: '#FFCC00' },
    13: { borderColor: '#FFAA00' },
    14: { borderColor: '#FF8800' },
    15: { borderColor: '#FF6600' },
    16: { borderColor: '#FF4400' },
    17: { borderColor: '#FF0000' },
    18: { borderColor: '#CC0000' },
    18.5: { borderColor: '#A61C00' },
    19: { borderColor: '#660000' },
    19.5: { borderColor: '#460C00' },
    20: { borderColor: '#360900' },
    20.1: { borderColor: '#240600' },
    20.2: { borderColor: '#130400' },
    20.3: { borderColor: '#000000' },
    20.4: { borderColor: '#0A031F' },
    20.5: { borderColor: '#0A031F' },
    20.6: { borderColor: '#180B3B' },
    20.7: { borderColor: '#180B3B' },
    20.8: { borderColor: '#261358' },
    20.9: { borderColor: '#2D1766' },
    21: {
      backgroundImage:
        'linear-gradient(45deg, rgb(104, 57, 224) 0%, rgb(39, 1, 132) 100%)',
      backgroundColor: '#351C75',
      backgroundOrigin: 'border-box'
    }
  };

  useEffect(() => {
    getAllDifficulty();

    // disable warning because getAllDifficulty method is intentionally not added
    // eslint-disable-next-line
  }, []);

  const getAllDifficulty = () => {
    get(`/levels/${topPlay.level.id}`).then((response) => {
      getDifficulty(response.data.difficulty);
    });
  };

  const videoId =
    /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/.exec(
      topPlay.url
    )[1];

  const { id, url, playPoint, level, player, speed, rawAccuracy } = topPlay;

  return (
    <a key={id} href={url} target='_blank' rel='noreferrer'>
      <section className='main-top-plays-container'>
        <div
          className='main-top-plays-image-container'
          style={difficultyColorDict[difficulty]}
        >
          <img
            className='main-top-plays-image'
            src={`https://i3.ytimg.com/vi/${videoId}/0.jpg`}
            alt=''
          />
        </div>

        <div className='main-top-plays-pp'>{playPoint.toFixed(0)} PP</div>

        <div className='main-top-plays-title'>
          <Link to={`/levels/${level.id}`}>{level.name}</Link>
          {/* XXX <a> cannot appear as a descendant of <a> */}
        </div>

        <div className='main-top-plays-player'>{player.name}</div>

        <div className='main-top-plays-spac'>
          <div>
            <img src={'other_icons/speed.svg'} alt='Speed Trial: ' />
            <span>{`${speed / 100}x`}</span>
          </div>

          <div style={{ marginLeft: '40px' }}>
            <img src={'other_icons/accuracy.svg'} alt='Accurancy: ' />
            <span>
              {rawAccuracy ? `${rawAccuracy.toFixed(2)}%` : 'UNKNOWN'}
            </span>
          </div>

          <div style={{ marginLeft: '40px' }}>
            <span>
              Lv.{' '}
              {difficulty < 20
                ? String(difficulty).replace('.5', '+')
                : difficulty}
            </span>
          </div>
        </div>
      </section>
    </a>
  );
};

export default MainTopPlay;
