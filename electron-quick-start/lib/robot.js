const robot = require('robotjs');

function RobotModule() {
  this.paste = () => {
    robot.keyToggle('control', 'down', 'command');
    robot.keyTap('v');
    robot.keyToggle('control', 'up', 'command');
  };
}


module.exports = RobotModule;
