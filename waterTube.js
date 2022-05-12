const COLORS = [
  "red",
  "green",
  "blue",
  "gray",
  "purple",
  "yellow",
  "pink",
  "orange",
  "brown",
];

class WaterTubes {
  constructor(config, nEmpty) {
    this.data = [];
    this.history = [];
    this._history = [];
    const n = config.length + nEmpty;
    this.initArrLists(config, n);
  }

  initArrLists(config, n) {
    for (let i = 0; i < n; i++) {
      if (i < config.length) {
        this.data[i] = config[i].map((idx) => COLORS[idx]);
      } else {
        this.data[i] = ["", "", "", ""];
      }
    }
  };
  
  getFirst(row) {
    let i = 0;
    let result;
    while (!result && i < this.data[row].length) {
      result = this.data[row][i];
      i++;
    }
    return [result, i-1];
  }
  
  pop(row) {
    const [result, idx] = this.getFirst(row)
    if (result && idx < this.data[row].length) {
        this.data[row][idx] = null;
    }
    return result;
  }
  
  push(row, newItem) {
     const arr = this.data[row];
     for (let i = arr.length - 1; i >= 0; i--) {
       if (!arr[i]) {
         arr[i] = newItem;
         break;
       }
     }
  }
  
  canMove(from, to) {
    const [existColor, j] = this.getFirst(to);
    if (!existColor) return true;  // 空的，任何颜色都可以
    if (!j) return false;          // 满的，任何颜色都不行

    // 有空位，需要判断颜色是否相同
    const [toMoveColor, idx] = this.getFirst(from);
    if (toMoveColor===existColor) {
      return true;
    }    
  }
  
  _move(from, to) {
    const color = this.pop(from);
    this.push(to, color);
    return color;
  }
  
  move(from, to) {
    while(this.canMove(from, to)) {
      const color = this._move(from, to);
      this.history.push(`move ${color} from ${from} to ${to}`);
      this._history.push({from, to});
    }
  }

  undo() {
    if (!this._history.length) return;
    let {from, to} = this._history.pop();
    this._move(to, from);
    this.history.pop();
    let undoMore = true;
    while (this._history.length && undoMore) {
      const history = this._history.pop();
      if (from===history.from && to===history.to) {
        this._move(history.to, history.from);
        this.history.pop();
      } else {
        this._history.push(history);
        undoMore = false;
      }
    }
  }

  get isSorted () {
    for (const arr of this.data) {
      if(!this.ifArrIsSorted(arr)) {
        return false;
      }
    }
    return true;
  }

  ifArrIsSorted (arr) {
    const color = arr[0];
    for (const item of arr) {
      if (item !== color) {
        return false;
      }
    }
    return true;
  }

  // 未解出
  solve() {
    const dfs = () => {
      // TODO: 避免 Maximum call stack size exceeded
  
      // 检查是否已经全分类好了
      if (this.isSorted) return true;
    
      // 遍历找到可以的from, to
      for (let from = 0; from < this.data.length; from++) {
        // 不再移动已经排好的管子
        if(this.ifArrIsSorted(this.data[from])) continue;

        for (let to = 0; to < this.data.length; to++) {
          if (from === to || !this.canMove(from, to)) {
            continue;
          }

          // 避免反复(倒过去又倒回来)
          if (this._history.length) {
            const history = this._history.pop();
            if (from===history.to && to===history.from) {
              this._history.push(history);
              continue;
            }
            this._history.push(history);
          }
    
          // 先跳过空管子，除非没路了
          // const [existColor] = this.getFirst(to);
          // if (!existColor) continue;

          // 试走这一步，如果最后走不通就undo（回溯）
          this.move(from, to);
          if (dfs()) {
            return true;
          } else {
            this.undo();  // TODO: 考虑这里它要有自己的history，按顺序undo...
          }
        }
      }
      // 没路了，看看空管子
      // for (let from = 0; from < this.data.length; from++) {
      //   // 不再移动已经排好的管子
      //   if(this.ifArrIsSorted(this.data[from])) continue;

      //   for (let to = 0; to < this.data.length; to++) {
      //     if (from === to || !this.canMove(from, to)) continue;

      //     // 只看空管子
      //     const [existColor] = this.getFirst(to);
      //     if (existColor) continue;

      //     // 避免反复(倒过去又倒回来)
      //     if (this._history.length) {
      //       const history = this._history.pop();
      //       if (from===history.to && to===history.from) {
      //         this._history.push(history);
      //         continue;
      //       }
      //       this._history.push(history);
      //     }

      //     // 试走这一步，如果最后走不通就undo（回溯）
      //     this.move(from, to);
      //     if (dfs()) {
      //       return true;
      //     } else {
      //       this.undo();  // TODO: 考虑这里它要有自己的history，按顺序undo...
      //     }
      //   }
      // }

      return false;
    }
  
    dfs();
  }
}