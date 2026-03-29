const ControlPanel = ({ trafficIntensity, onIntensityChange, onSpawnVehicle }) => {
  const vehicleTypes = [
    { id: 'sport', name: 'Sport Car', icon: '🏎️', color: 'bg-blue-500', description: 'Short prompts' },
    { id: 'car', name: 'Sedan', icon: '🚗', color: 'bg-green-500', description: 'Medium prompts' },
    { id: 'truck', name: 'Truck', icon: '🚚', color: 'bg-orange-500', description: 'Long prompts' },
    { id: 'bus', name: 'Bus', icon: '🚌', color: 'bg-purple-500', description: 'Batch requests' },
    { id: 'ambulance', name: 'Ambulance', icon: '🚑', color: 'bg-red-500', description: 'Priority' }
  ]

  const presets = [
    { name: 'Trickle', value: 10, icon: '💧' },
    { name: 'Steady', value: 40, icon: '🚗' },
    { name: 'Rush Hour', value: 80, icon: '🚨' },
    { name: 'Gridlock', value: 100, icon: '⚠️' }
  ]

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
        <span className="text-redhat-red">🎮</span> Traffic Control Center
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Intensity Slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-300">Traffic Intensity</label>
            <span className="text-2xl font-bold text-redhat-red">{trafficIntensity}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={trafficIntensity}
            onChange={(e) => onIntensityChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-redhat-red"
          />

          {/* Presets */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onIntensityChange(preset.value)}
                className="glass hover:bg-white/10 transition-all rounded-lg px-3 py-2 text-sm font-semibold"
              >
                <div className="text-xl mb-1">{preset.icon}</div>
                <div className="text-xs">{preset.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Spawner */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Spawn Vehicles</h3>
          <div className="grid grid-cols-2 gap-2">
            {vehicleTypes.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => onSpawnVehicle(vehicle.id)}
                className="glass hover:bg-white/10 transition-all rounded-lg p-3 text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{vehicle.icon}</span>
                  <span className="font-semibold text-sm">{vehicle.name}</span>
                </div>
                <div className="text-xs text-gray-400">{vehicle.description}</div>
                <div className={`h-1 ${vehicle.color} rounded-full mt-2 opacity-50 group-hover:opacity-100 transition-opacity`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => {
            onIntensityChange(100)
            setTimeout(() => onIntensityChange(50), 5000)
          }}
          className="flex-1 bg-redhat-red hover:bg-red-700 transition-colors rounded-lg px-4 py-3 font-semibold"
        >
          🚨 Rush Hour Burst (5s)
        </button>
        <button
          onClick={() => onIntensityChange(0)}
          className="flex-1 bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg px-4 py-3 font-semibold"
        >
          🛑 Clear Traffic
        </button>
      </div>
    </div>
  )
}

export default ControlPanel
