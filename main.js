const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    const activeTube = ref(null);
    const nTubes = ref(2);
    const currConfigIdx = ref(0);
    let waterTubes;
    const state = ref([]);
    const history = ref([]);

    const reset = () => {
      waterTubes = new WaterTubes(configs[currConfigIdx.value], nTubes.value);
      state.value = waterTubes.data;
      history.value = waterTubes.history;
    }

    reset();

    const handleClickTube = (idx) => {
      if (activeTube.value === idx) {
        activeTube.value = null;
      } else if (activeTube.value !== null) {
        waterTubes.move(activeTube.value, idx);
        activeTube.value = null;
      } else {
        activeTube.value = idx;
      }
      if (waterTubes.isSorted) {
        console.log('恭喜完成！');
      }
    };

    const updateView = () => {
      activeTube.value = 0;
      activeTube.value = null;
    }

    const handleClickResetBtn = () => {
      reset();
    }

    const handleClickUndoBtn = () => {
      waterTubes.undo();
      updateView();
    }

    const handleClickRedoBtn = () => {
      waterTubes.redo();
      updateView();
    }
    
    const handleClickSolveBtn = () => {
      waterTubes.solve();
      updateView();
    }

    const handleClickLastBtn = () => {
      if (currConfigIdx.value > 0) {
        currConfigIdx.value -= 1;
      } else {
        console.log('没有上一关了');
      }
      reset();
    }

    const handleClickNextBtn = () => {
      if (currConfigIdx.value < configs.length - 1) {
        currConfigIdx.value += 1;
      } else {
        console.log('没有下一关了');
      }
      reset();
    }

    return {
      nTubes,
      state,
      activeTube,
      history,
      currConfigIdx,
      handleClickTube,
      handleClickResetBtn,
      handleClickUndoBtn,
      handleClickRedoBtn,
      handleClickSolveBtn,
      handleClickLastBtn,
      handleClickNextBtn,
    };
  },
}).mount("#app");
