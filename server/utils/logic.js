var cache = require('./cacheHelper');
var _ = require('underscore');
var config = require('../config');
var moment = require('moment');

function isCanExecute(roomId, command) {
    if (!roomId || !command) return false;
    var x = cache.getSocketById(roomId);

    if (!x && !x.payload) return false;
    var p = x.payload;

    var currStatus = p.CurrStatus;

    if (command === 'start') {
        return (currStatus === 'Ready' || currStatus === 'Paused');
    } else if (command === 'pause') {
        return currStatus === 'Running';
    } else if (command === 'restart') {
        return (currStatus === 'Ready' || currStatus === 'Starting' || currStatus === 'Running' || currStatus === 'Pausing' || currStatus === 'Paused');
    }

    return false;
}

var ProcessModeEnum = {
    None: 'None',
    SingleMode: 'SingleMode',
    FixedVolumeMode: 'FixedVolumeMode',
    VariantVolumeMode: 'VariantVolumeMode',
    CorelateVolumeMode: 'CorelateVolumeMode'
};

var DirectionEnum = {
    In: 'In',
    Out: 'Out'
};

function GetAllTimes(cultivation) {
    if (!cultivation || cultivation.Period === 0) return 1;

    var startTime = new Date(cultivation.StartTime).getTime();
    var endTime = new Date(cultivation.EndTime).getTime();

    var minutes = 1000 * 60;
    var hours = minutes * 60;

    var total = config.IsDebug ? (endTime - startTime) / minutes : (endTime - startTime) / hours;

    return Math.floor(total / cultivation.Period);
}

function GetTotalVolumeByDoubleTimes(cultivation, doubleTimes) {
    if (!cultivation.IsBindWithOtherPump) return cultivation.InitialVolume * Math.pow(2, doubleTimes);
    var totalVolume = 0;

    if (cultivation.Direction == DirectionEnum.In) {
        totalVolume = cultivation.InitialVolume * Math.pow(2, doubleTimes - 1) * 1.8;
    } else {
        totalVolume = cultivation.InitialVolume * Math.pow(2, doubleTimes) * 0.8;
    }

    return totalVolume;
}


function GetTotalVolumeForTotalTimeDurationWhenBind(cultivation, runTimes) {
    var totalVolume = 0;
    if (cultivation.Period == 0) {
        return 0;
    }

    if (runTimes == 0) {
        return cultivation.Direction == DirectionEnum.In ? cultivation.InitialVolume : cultivation.InitialVolume * 0.8;
    }

    if (cultivation.Direction == DirectionEnum.In) {
        var multiple = Math.ceil(runTimes / cultivation.Period);
        totalVolume = cultivation.InitialVolume * Math.pow(2, multiple - 1) * 1.8;
    } else {
        totalVolume = cultivation.InitialVolume * Math.pow(2, runTimes) * 0.8;
    }

    return totalVolume;
}


//times为运行次数
function GetTotalVolumeForTotalTimeDurationWhenNoBind(cultivation, runTimes) {
    var totalVolume = 0;
    if (cultivation.Period === 0) {
        return 0;
    }

    if (runTimes === 0) {
        return cultivation.InitialVolume;
    }
    var multiple = Math.ceil(runTimes / cultivation.Period);
    totalVolume = cultivation.InitialVolume * Math.pow(2, multiple);

    return totalVolume;
}


function GetTotalVolumeForTotalTimeDuration(cultivation, times) {
    return cultivation.IsBindWithOtherPump ? GetTotalVolumeForTotalTimeDurationWhenBind(cultivation, times) :
        GetTotalVolumeForTotalTimeDurationWhenNoBind(cultivation, times);
}

function GetVolumePerTime(cultivation, times) {
    var total = GetTotalVolumeForTotalTimeDuration(cultivation, times);

    if (cultivation.Period === 0) return total;

    if (cultivation.Direction == DirectionEnum.In)
        return times === 0 ? total : total / cultivation.Period;

    return GetTotalVolumeForTotalTimeDuration(cultivation, times);
}

function checkCultivation(pumps) {
    var errMsg = "";
    var list = _.where(pumps, p => p.IsUseabled); //.sortBy('PumpId');

    if(list.length == 0) 
    {
        errMsg = "没有运行的泵，请检测配置";
        return errMsg;
    }

    for (var i = 0, len = list.length; i < len; i++) {
        var cur = list[i];

        if (cur.InitialFlowRate <= 0 || cur.InitialFlowRate >= 100) {
            errMsg = `pump${cur.PumpId}的流速取值范围为大于0并且小于100`;
            return errMsg;
        }

        if (cur.InitialVolume <= 0) {
            errMsg = `pump${cur.PumpId}的流量必须大于0`;
            return errMsg;
        }

        if (cur.StartTime >= cur.EndTime) {
            errMsg = `pump${cur.PumpId}的开始时间必须小于结束时间`;
            return errMsg;
        }

        if (cur.ProcessMode == ProcessModeEnum.FixedVolumeMode) {
            if (cur != null) {
                var firstSpan = cur.InitialVolume / cur.InitialFlowRate;
                var span = cur.Volume / cur.FlowRate;

                if (cur.FlowRate <= 0 || cur.FlowRate >= 10) {
                    errMsg = `pump${cur.PumpId}的流速取值范围为大于0并且小于10`;
                    return errMsg;
                }

                if (!config.IsDebug) {
                    span = span / 60;
                    firstSpan = firstSpan / 60;
                }

                if (cur.Period != 0) {
                    if (span >= cur.Period || firstSpan >= cur.Period) {
                        errMsg = `pump${cur.PumpId}每次运行时间大于Period`;
                        return errMsg;
                    }
                }

                if (cur.Direction == DirectionEnum.In) {
                    if (firstSpan > cur.FirstSpan) {
                        errMsg = `pump${cur.PumpId}首次运行时间大于FirstSpan`;
                        return errMsg;
                    }
                }
            }
        } else if (cur.ProcessMode == ProcessModeEnum.VariantVolumeMode) {
            if (cur != null) {
                var time = GetAllTimes(cur);

                if (time > config.MAX_VARIANT_TIMES) {
                    errMsg = `pump${cur.PumpId}变量模式最多能翻倍为${config.MAX_VARIANT_TIMES}次`;
                    return errMsg;
                }

                var input = GetTotalVolumeByDoubleTimes(cur, time);

                if (input > config.MAX_VARIANT_VOLUME) {
                    errMsg = `pump${cur.PumpId}变量模式最大输入量为${config.MAX_VARIANT_VOLUME}ml`;
                    return errMsg;
                }

                var perTime = GetVolumePerTime(cur, time) / cur.InitialFlowRate;
                if (perTime > config.MAX_VARIANT_SINGLE_RUNTIME) {
                    errMsg = `pump${cur.PumpId}变量模式单次最大输入时间为${config.MAX_VARIANT_SINGLE_RUNTIME}min`;
                    return errMsg;
                }
            }
        } else if (cur.ProcessMode == ProcessModeEnum.CorelateVolumeMode) {
            errMsg = `pump${cur.PumpId}CorelateVolumeMode 未实现`;
            return errMsg;
        }
    }

    return errMsg;

}

module.exports = {
    isCanExecute: isCanExecute,
    checkCultivation: checkCultivation
};