
define([], function () {
    return {
        periodic: function({trigfunc, freq, phase, radians}) {
            return trigfunc(phase + freq * radians);
        },
    };
});
