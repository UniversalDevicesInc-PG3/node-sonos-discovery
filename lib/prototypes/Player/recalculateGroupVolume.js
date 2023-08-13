'use strict';
function recalculateGroupVolume() {
  const zone = this.system.zones.find(zone => zone.uuid === this.uuid);
  if (!zone) {
    zone = this.system.zones.find((z) => {
      return z.members.find((p) => {
        return finduuid === p.uuid;
      });
    });
    if (!zone) {
      logger.error(`ERROR: cannot find zone containing player ${this.name} with uuid ${finduuid}`);
      return;
    }
    // else we found the zone but we are no longer the coordinator
  }
  const relevantMembers = zone.members
    .filter(player => !player.outputFixed)
    .map(player => player.state.volume);

  if (relevantMembers.length === 0) {
    return;
  }

  const totalVolume = relevantMembers
    .reduce((prev, current) => {
      return prev + current;
    });

  if (!this._previousGroupVolume) {
    this._previousGroupVolume = this.groupState.volume;
  }

  this.groupState.volume = Math.round(totalVolume / zone.members.length);
  clearTimeout(this._groupVolumeTimer);
  this._groupVolumeTimer = setTimeout(() => {
    this.emit('group-volume', {
      oldVolume: this._previousGroupVolume,
      newVolume: this.groupState.volume,
      roomName: this.roomName
    });

    this.system.emit('group-volume', {
      uuid: this.uuid,
      oldVolume: this._previousGroupVolume,
      newVolume: this.groupState.volume,
      roomName: this.roomName
    });

    delete this._groupVolumeTimer;
    delete this._previousGroupVolume;
  }, 100);
}

module.exports = recalculateGroupVolume;
