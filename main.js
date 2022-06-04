const { createApp, ref, computed, watch } = Vue;
// var waterTubes;

const myapp = createApp({
  setup() {
    const activeTube = ref(null);
    const nTubes = ref(2);
    const nLayers = ref(4);
    const currConfigIdx = ref(0);
    const configsLen = ref(configs.length);
    const state = ref([]);
    const msg = ref('');
    let waterTubes;
    let timer;
    
    const reset = () => {
      const config = configs[currConfigIdx.value]
      waterTubes = new WaterTubes(config, nTubes.value, (config)=>{
        configs[currConfigIdx.value] = config;
        localStorage.setItem('sortPuz: configs', JSON.stringify(configs));
      });
      state.value = waterTubes.data;
      nLayers.value = waterTubes.nLayers;
    }
    const save = () => {
      if (waterTubes.history.length) {
        localStorage.setItem(`sortPuz: data ${currConfigIdx.value}`, JSON.stringify([state.value, waterTubes.history, nLayers.value]));
      } else {
        localStorage.removeItem(`sortPuz: data ${currConfigIdx.value}`);
      }
    }
    const init = () => {
      const curr = +localStorage.getItem('sortPuz: currConfigIdx');
      currConfigIdx.value = curr || 0;
      const _configs = localStorage.getItem('sortPuz: configs');
      if (_configs) {
        configs = JSON.parse(_configs);
        configsLen.value = configs.length;
      }
    }
    const load = () => {
      // 兼容
      const missConfigs = currConfigIdx.value + 1 - configs.length;
      if (missConfigs > 0) {
        for (let i=currConfigIdx.value; i >= configs.length; i--) {
          localStorage.removeItem(`sortPuz: data ${i}`);
        }
        currConfigIdx.value = configs.length - 1;
      }

      const obj =  JSON.parse(localStorage.getItem(`sortPuz: data ${currConfigIdx.value}`));
      if (obj) {
        const [data, history, nLayers] = obj;
        waterTubes.loadData(data, history, nLayers);
        state.value = waterTubes.data;
        nLayers.value = waterTubes.nLayers;
      }
    }
    
    init();
    reset();
    load();

    const getHistoryText = () => {
      return waterTubes.history.map(x=>`move ${COLORS[x.color] || x.color} x ${x.count} from ${x.from} to ${x.to}`).join('\n')
    };
    const getHistoryLength = () => {
      return waterTubes.history.length;
    }
    const getCanRedo = () => {
      return waterTubes.canRedo();
    }
    const getColor = (arr, i) => {
      return COLORS_MAP[COLORS[arr[i]]] || arr[i] || 'transperant'
    }

    const getRandomConfig = () => {
      console.log('getRandomConfig');

      const n = configs[currConfigIdx.value].length;
      const config = waterTubes.genConfig(n);
      configs.push(config);
      configsLen.value = configs.length;
      localStorage.setItem('sortPuz: configs', JSON.stringify(configs));
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
      save();
    };

    const updateView = () => {
      activeTube.value = 0;
      activeTube.value = null;
    }

    const handleClickResetBtn = () => {
      clearTimeout(timer);
      // reset();
      waterTubes.reset();
      updateView();
      save();
    }

    const handleClickUndoBtn = () => {
      clearTimeout(timer);
      waterTubes.undo();
      updateView();
      save();
    }
    
    const handleClickRedoBtn = (auto) => {
      if (!auto) {
        clearTimeout(timer);
      }
      if (!waterTubes._redoHistory?.length) return;
      const { from } = waterTubes._redoHistory[waterTubes._redoHistory.length-1];
      activeTube.value = from;
      setTimeout(() => {        
        waterTubes.redo();
        updateView();
        save();
      }, 300);
    }

    const showToast = (_msg, duration=4000) => {
      msg.value = _msg;
      setTimeout(() => {
        msg.value = "";
      }, duration);
    }

    const handleClickSolveBtn = () => {
      const _msg = waterTubes.solve();
      if (_msg) {
        showToast(_msg);
      }
      updateView();
      save();
    }

    const handleClickPlayBtn = () => {
      function solveAnimation(interval = 500) {
        function step() {  
          handleClickRedoBtn(true);
    
          if (waterTubes._redoHistory.length) {
            timer = setTimeout(() => {
              window.requestAnimationFrame(step);
            }, interval);
          }
        }
    
        window.requestAnimationFrame(step);
      }

      const initialHistoryLen = waterTubes.history.length;
      const _msg = waterTubes.solve();
      if(!_msg) {
        // undo 到 initialHistoryLen
        while(waterTubes.history.length > initialHistoryLen) {
          waterTubes.undo();
        }
        solveAnimation();
      } else {
        showToast(_msg);
      }
      save();
    }


    const handleClickLastBtn = () => {
      clearTimeout(timer);
      currConfigIdx.value -= 1;
    }

    const handleClickNextBtn = () => {
      clearTimeout(timer);
      if (currConfigIdx.value >= configs.length - 1) {
        getRandomConfig();
      }
      currConfigIdx.value += 1;
    }

    watch(currConfigIdx, () => {
      reset();
      load();
      localStorage.setItem('sortPuz: currConfigIdx', currConfigIdx.value);
    })

    watch(nTubes, () => {
      clearTimeout(timer);
      reset();
      // 稍微能保留data目前做的，但是有bug，不如直接reset
      // const configLen = configs[currConfigIdx.value].length;
      // waterTubes = new WaterTubes(waterTubes.data.slice(0, configLen), nTubes.value);
      // state.value = waterTubes.data;
      // nLayers.value = waterTubes.nLayers;
      localStorage.setItem('sortPuz: currConfigIdx', currConfigIdx.value);   
    })

    return {
      state,
      nTubes,
      nLayers,
      activeTube,
      currConfigIdx,
      configsLen,
      msg,
      getHistoryText,
      getHistoryLength,
      getCanRedo,
      getColor,
      handleClickTube,
      handleClickResetBtn,
      handleClickUndoBtn,
      handleClickRedoBtn,
      handleClickSolveBtn,
      handleClickPlayBtn,
      handleClickLastBtn,
      handleClickNextBtn,
    };
  },
}).mount("#app");
