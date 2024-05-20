import browser from 'webextension-polyfill';
import * as balloons from '@/balloons';
import { getBalloonContainer, importStylesheet, weightedRandom } from '@/utils';

(() => {
  // Prevent running in popup
  if (document.body.id === 'pop-a-loon') return;

  importStylesheet(
    'balloon-styles',
    browser.runtime.getURL('resources/stylesheets/style.css')
  );

  // Add the balloon container to the document
  const _ = getBalloonContainer();

  const balloonClasses = Object.values(balloons);
  // Make a list from the spawn_chance from each balloon class
  const spawnChances = balloonClasses.map(
    (BalloonType) => BalloonType.spawn_chance
  );

  // Create a new balloon and make it rise
  const Balloon = weightedRandom(balloonClasses, spawnChances, {
    default: balloons.Default,
  });

  const balloon = new Balloon();
  balloon.rise();
})();
