function getSeconds(hms) {
  // Source - https://stackoverflow.com/a/45292588
  // Posted by Paul, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-03-17, License - CC BY-SA 4.0
  let seconds = hms.split(":").reduce((acc, time) => 60 * acc + +time);

  return seconds;
}

module.exports = { getSeconds };
