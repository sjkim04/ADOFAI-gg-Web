import React from 'react';
import Swal from 'sweetalert2';

// Components
import MainAddInfo from '../components/MainAddInfo';
import MainTopPlays from '../components/MainTopPlays';
import MainPopularLevels from '../components/MainPopularLevels';

// Stylesheets
import '../stylesheets/main.css';

const HomePage = () => {
  function userMenu() {
    Swal.fire({
      title: 'User Menu',
      html: `
      <a class="user-menu-context" href="https://forms.gle/XdKNuqVrt974F7Ab6">Submit your play</a>
      <hr>
      <a class="user-menu-context" href="https://forms.gle/cW9wGpEoTV4yD57b7">Submit your custom level</a>
      <hr>
      <a class="user-menu-context" href="https://docs.google.com/forms/d/e/1FAIpQLSff8C5U7_aXwwO56uvnZMvLoA6P3iY8YRAg2J2UVAusHOkM2Q/viewform?usp=sf_link">Request for re-leveling</a>
      <hr>
      <a class="user-menu-context" href="https://7thbe.at/verified-artists">Song copyrights</a>
      `,
      customClass: {
        popup: "user-menu"
      },
      showConfirmButton: false,
    });
  }

  return (
    <main>
      <img className="main-logo" src="http://localhost:3000/logo.svg" alt="" />
      <h2 style={{ marginTop: '10px' }}>Based On The <a href="https://docs.google.com/spreadsheets/d/1PzLHfWmVWJHrBGnNSsLTsdH0ibdk0hB4MpKHET1nkpU/edit#gid=1848316468" target="_blank" rel="noreferrer"><span className="yellow-highlight">Unofficial ADOFAI Forum</span></a></h2>
      <input className="main-search-bar" type="text" placeholder="Search Song, Artist, or Creator" />
      <MainAddInfo playersOnline='999999' rankedPlayers='999999' rankedLevels='999999' unclearedLevels='999999'/>
      <MainTopPlays />
      <MainPopularLevels />
      <button onClick={userMenu} className='user-menu-button'></button>
    </main>
  );
};
export default HomePage;