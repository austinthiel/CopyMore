const ref = require('ref');
const ffi = require('ffi');
const Struct = require('ref-struct');

function User32Module() {
  const MousePoint = Struct({
    x: 'long',
    y: 'long',
  });

  const MousePointPtr = ref.refType(MousePoint);

  const user32 = new ffi.Library('user32', {
    GetCursorPos: ['long', [MousePointPtr, 'pointer']],
    GetTopWindow: ['long', ['long']],
    FindWindowA: ['long', ['string', 'string']],
    SetActiveWindow: ['long', ['long']],
    SetForegroundWindow: ['bool', ['long']],
    BringWindowToTop: ['bool', ['long']],
    ShowWindow: ['bool', ['long', 'int']],
    SwitchToThisWindow: ['void', ['long', 'bool']],
    GetForegroundWindow: ['long', []],
    AttachThreadInput: ['bool', ['int', 'long', 'bool']],
    GetWindowThreadProcessId: ['int', ['long', 'int']],
    SetWindowPos: ['bool', ['long', 'long', 'int', 'int', 'int', 'int', 'uint']],
    SetFocus: ['long', ['long']],
  });

  this.GetForegroundWindow = () => {
    user32.GetForegroundWindow();
  };

  this.GetCursorCoordinates = () => {
    const mousePosition = new MousePoint();
    user32.GetCursorPos(mousePosition.ref(), null);
    console.log(`X: ${mousePosition.x}, Y: ${mousePosition.y}`);
    return {
      x: mousePosition.x,
      y: mousePosition.y,
    };
  };

  this.ReturnAllFocusToWindow = (HWnd) => {
    user32.SetForegroundWindow(HWnd);
    user32.ShowWindow(HWnd, 5);
    user32.SetFocus(HWnd);
    user32.SetActiveWindow(HWnd);
  };
}

module.exports = User32Module;
