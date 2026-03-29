import { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'

const LANE_HEIGHT = 120
const LANE_WIDTH = 1000
const VEHICLE_SPEED_BASE = 2

const Highway = ({ lanes, trafficIntensity, gameMode }) => {
  const canvasRef = useRef(null)
  const appRef = useRef(null)
  const vehiclesRef = useRef([])
  const lanesContainerRef = useRef([])

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize PixiJS application
    const app = new PIXI.Application({
      width: 1200,
      height: 600,
      backgroundColor: 0x2d3748,
      antialias: true
    })

    canvasRef.current.appendChild(app.view)
    appRef.current = app

    // Create highway background
    const background = new PIXI.Graphics()
    background.beginFill(0x1a202c)
    background.drawRect(0, 0, 1200, 600)
    background.endFill()
    app.stage.addChild(background)

    // Create lanes
    const laneYPositions = [80, 200, 320, 440]
    const laneColors = [0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6]

    lanesContainerRef.current = laneYPositions.map((y, index) => {
      const laneContainer = new PIXI.Container()
      laneContainer.y = y

      // Lane background
      const laneGraphic = new PIXI.Graphics()
      laneGraphic.beginFill(0x374151, 0.3)
      laneGraphic.drawRoundedRect(20, -50, LANE_WIDTH, 100, 10)
      laneGraphic.endFill()

      // Lane markers (dashed lines)
      for (let x = 20; x < LANE_WIDTH; x += 60) {
        const dash = new PIXI.Graphics()
        dash.beginFill(0x9ca3af, 0.3)
        dash.drawRect(x, 0, 40, 2)
        dash.endFill()
        laneGraphic.addChild(dash)
      }

      laneContainer.addChild(laneGraphic)

      // Lane label
      const labelText = index === 3 ? 'HOV (Cache)' : `Lane ${index + 1}`
      const label = new PIXI.Text(labelText, {
        fontFamily: 'Red Hat Text',
        fontSize: 14,
        fill: 0xffffff,
        fontWeight: '600'
      })
      label.x = 1050
      label.y = -10
      laneContainer.addChild(label)

      // Status indicator
      const statusCircle = new PIXI.Graphics()
      statusCircle.beginFill(index < 2 ? 0x10b981 : 0x6b7280)
      statusCircle.drawCircle(1100, 0, 6)
      statusCircle.endFill()
      laneContainer.addChild(statusCircle)
      laneContainer.statusCircle = statusCircle

      app.stage.addChild(laneContainer)
      return laneContainer
    })

    // Animation loop
    app.ticker.add((delta) => {
      // Update vehicles
      vehiclesRef.current.forEach((vehicle, index) => {
        vehicle.sprite.x += vehicle.speed * delta

        // Remove vehicles that have left the screen
        if (vehicle.sprite.x > LANE_WIDTH + 100) {
          vehicle.sprite.destroy()
          vehiclesRef.current.splice(index, 1)
        }
      })
    })

    // Cleanup
    return () => {
      app.destroy(true, { children: true, texture: true })
    }
  }, [])

  // Update lane statuses
  useEffect(() => {
    if (!lanesContainerRef.current.length) return

    lanes.forEach((lane, index) => {
      if (index >= 3) return // Skip HOV lane for now

      const laneContainer = lanesContainerRef.current[index]
      const statusCircle = laneContainer.statusCircle

      if (statusCircle) {
        // Update status color
        statusCircle.clear()
        const color = lane.status === 'active' ? 0x10b981 :
                     lane.status === 'scaling' ? 0xf59e0b : 0x6b7280
        statusCircle.beginFill(color)
        statusCircle.drawCircle(1100, 0, 6)
        statusCircle.endFill()
      }
    })
  }, [lanes])

  // Spawn vehicles based on traffic intensity
  useEffect(() => {
    if (!appRef.current) return

    const spawnInterval = setInterval(() => {
      spawnRandomVehicle()
    }, Math.max(500, 3000 - (trafficIntensity * 25)))

    return () => clearInterval(spawnInterval)
  }, [trafficIntensity])

  const spawnRandomVehicle = () => {
    if (!appRef.current || !lanesContainerRef.current.length) return

    const vehicleTypes = [
      { type: 'car', color: 0x3b82f6, width: 40, height: 24, speed: 3 },
      { type: 'truck', color: 0xf59e0b, width: 50, height: 28, speed: 1.5 },
      { type: 'sport', color: 0x8b5cf6, width: 35, height: 20, speed: 5 }
    ]

    const randomType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]
    const randomLane = Math.floor(Math.random() * 3)

    spawnVehicle(randomLane, randomType)
  }

  const spawnVehicle = (laneIndex, vehicleType) => {
    if (!appRef.current || !lanesContainerRef.current[laneIndex]) return

    const vehicle = new PIXI.Graphics()

    // Draw vehicle body
    vehicle.beginFill(vehicleType.color)
    vehicle.drawRoundedRect(0, -vehicleType.height / 2, vehicleType.width, vehicleType.height, 4)
    vehicle.endFill()

    // Add windows
    vehicle.beginFill(0x1a202c, 0.6)
    vehicle.drawRoundedRect(5, -vehicleType.height / 2 + 4, vehicleType.width - 10, vehicleType.height - 8, 2)
    vehicle.endFill()

    // Add headlights
    vehicle.beginFill(0xffffff)
    vehicle.drawCircle(vehicleType.width - 5, -vehicleType.height / 2 + 5, 2)
    vehicle.drawCircle(vehicleType.width - 5, vehicleType.height / 2 - 5, 2)
    vehicle.endFill()

    vehicle.x = -vehicleType.width - 20
    vehicle.y = 0

    lanesContainerRef.current[laneIndex].addChild(vehicle)

    vehiclesRef.current.push({
      sprite: vehicle,
      speed: vehicleType.speed * VEHICLE_SPEED_BASE,
      type: vehicleType.type,
      lane: laneIndex
    })
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 glass rounded-lg px-4 py-2 z-10">
        <div className="text-xs text-gray-400">Highway Traffic</div>
        <div className="text-lg font-semibold text-white">
          {vehiclesRef.current.length} vehicles
        </div>
      </div>
      <div ref={canvasRef} className="rounded-lg overflow-hidden" />
    </div>
  )
}

export default Highway
