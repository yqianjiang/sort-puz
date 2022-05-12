const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    const activeTube = ref(null);
    const nTubes = ref(9);
    const config = [
      [2, 8, 6, 4],
      [0, 2, 2, 4],
      [1, 3, 6, 1],
      [6, 0, 4, 4],
      [6, 2, 8, 3],
      [0, 8, 1, 1],
      [8, 3, 0, 3],
    ];
    const waterTubes = new WaterTubes(config, nTubes.value);
    const arrLists = ref(waterTubes.data);

    const handleClickTube = (idx) => {
      if (activeTube.value === idx) {
        activeTube.value = null;
      } else if (activeTube.value !== null) {
        waterTubes.move(activeTube.value, idx);
        activeTube.value = null;
      } else {
        activeTube.value = idx;
      }
    };

    return {
      nTubes,
      arrLists,
      activeTube,
      handleClickTube,
    };
  },
}).mount("#app");
