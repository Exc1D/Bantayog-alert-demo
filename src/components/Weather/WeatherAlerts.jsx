const ALERT_COLORS = {
  watch: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', icon: '\u{1F7E1}' },
  warning: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-800', icon: '\u{1F7E0}' },
  alert: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', icon: '\u{1F534}' }
};

export default function WeatherAlerts({ alerts = [] }) {
  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\u2705'}</span>
          <div>
            <p className="font-semibold text-green-800 text-sm">No Active Weather Alerts</p>
            <p className="text-xs text-green-600">Conditions are normal across the province</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold flex items-center gap-2">
        {'\u26A0\uFE0F'} Weather Alerts
      </h3>
      {alerts.map((alert, index) => {
        const colors = ALERT_COLORS[alert.severity] || ALERT_COLORS.watch;
        return (
          <div
            key={index}
            className={`${colors.bg} border-l-4 ${colors.border} rounded-r-xl p-4`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{colors.icon}</span>
              <div>
                <p className={`font-bold text-sm ${colors.text} uppercase`}>
                  {alert.type?.replace('-', ' ')} {alert.severity}
                </p>
                <p className="text-sm mt-1">{alert.message}</p>
                {alert.municipality && (
                  <p className="text-xs text-gray-500 mt-1">
                    Area: {alert.municipality}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
