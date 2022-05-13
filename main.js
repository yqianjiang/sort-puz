const { createApp, ref, computed } = Vue;
// var waterTubes;

createApp({
  setup() {
    const activeTube = ref(null);
    const nTubes = ref(2);
    const nLayers = ref(4);
    const currConfigIdx = ref(0);
    const state = ref([]);
    const history = ref([]);
    let waterTubes;
    
    const reset = () => {
      const config = configs[currConfigIdx.value]
      waterTubes = new WaterTubes(config, nTubes.value);
      state.value = waterTubes.data;
      history.value = waterTubes.history;
      nLayers.value = waterTubes.nLayers;
    }
    
    reset();

    const getHistoryText = () => {
      return history.value.map(x=>`move ${COLORS[x.color] || x.color} x ${x.count} from ${x.from} to ${x.to}`).join('\n')
    };
    const getColor = (arr, i) => {
      return COLORS_MAP[arr[i]] || arr[i] || 'transperant'
    }

    const getRandomNum = (min, max) => {
      return Math.random() * (max - min);
    }

    const getRandomConfig = (n) => {
      console.log('getRandomConfig');
      const config = new Array(n).fill(1).map((x, i)=>{
        const result = [];
        for (let j=0; j<nLayers.value; j++) {
          result.push(i); 
        }
        return result;
      });
      for (let i=0; i<n; i++) {
        for (let j=0; j<nLayers.value; j++) {
          const x = Math.round(getRandomNum(0, n-1));
          const y = Math.round(getRandomNum(0, nLayers.value-1));
          [config[i][j], config[x][y]] = [config[x][y], config[i][j]];
        }
      }
      return config;
    }

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
        const n = configs[currConfigIdx.value].length;
        const dn = n < COLORS.length ? 1 : 0;
        configs.push(getRandomConfig(n + dn));
        currConfigIdx.value += 1;
      }
      reset();
    }

    return {
      state,
      nTubes,
      nLayers,
      activeTube,
      currConfigIdx,
      getHistoryText,
      getColor,
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
