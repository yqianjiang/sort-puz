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
  constructor(config, n) {
    this.data = [];
    this.history = [];
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
    if (!existColor) return true;
    if (!j) return false;
    const [toMoveColor, idx] = this.getFirst(from);
    if (toMoveColor===existColor) {
      return true;
    }    
  }
  
  move(from, to) {
    while(this.canMove(from, to)) {
      const color = this.pop(from);
      this.push(to, color);
      this.history.push(`move ${color} from ${from} to ${to}`);
    }
  }
}