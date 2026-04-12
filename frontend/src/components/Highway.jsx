import { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'

const LANE_HEIGHT = 120
const LANE_WIDTH = 1000
const VEHICLE_SPEED_BASE = 2

// Helper function to create vehicle sprites
const createVehicleSprite = (vehicleType) => {
  const vehicleTypes = {
    sport: { color: 0x3b82f6, width: 35, height: 20 },
    car: { color: 0x10b981, width: 40, height: 24 },
    truck: { color: 0xf59e0b, width: 50, height: 28 },
    bus: { color: 0x8b5cf6, width: 60, height: 28 },
    ambulance: { color: 0xef4444, width: 40, height: 24 }
  }

  const config = vehicleTypes[vehicleType] || vehicleTypes.car
  const vehicle = new PIXI.Graphics()

  // Draw vehicle body
  vehicle.beginFill(config.color)
  vehicle.drawRoundedRect(0, -config.height / 2, config.width, config.height, 4)
  vehicle.endFill()

  // Add windows
  vehicle.beginFill(0x1a202c, 0.6)
  vehicle.drawRoundedRect(5, -config.height / 2 + 4, config.width - 10, config.height - 8, 2)
  vehicle.endFill()

  // Add headlights
  vehicle.beginFill(0xffffff)
  vehicle.drawCircle(config.width - 5, -config.height / 2 + 5, 2)
  vehicle.drawCircle(config.width - 5, config.height / 2 - 5, 2)
  vehicle.endFill()

  return vehicle
}

const Highway = ({ lanes, vehicles, trafficIntensity, gameMode }) => {
  const canvasRef = useRef(null)
  const appRef = useRef(null)
  const vehicleSpritesRef = useRef({})
  const vehicleTargetsRef = useRef({}) // Store target positions for smooth animation
  const lanesContainerRef = useRef([])

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize PixiJS application (async in v8)
    let app

    ;(async () => {
      app = new PIXI.Application()
      await app.init({
        width: 1200,
        height: 600,
        backgroundColor: 0x2d3748,
        antialias: true
      })

      canvasRef.current.appendChild(app.canvas)
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

      // Animation loop - smooth interpolation
      app.ticker.add(() => {
        // Smoothly move vehicles toward their target positions
        Object.keys(vehicleSpritesRef.current).forEach(vehicleId => {
          const sprite = vehicleSpritesRef.current[vehicleId]
          const target = vehicleTargetsRef.current[vehicleId]

          if (sprite && target !== undefined) {
            // Smooth interpolation (lerp) - 0.2 is the smoothing factor
            sprite.x += (target - sprite.x) * 0.2
          }
        })
      })
    })()

    // Cleanup
    return () => {
      if (app) app.destroy(true, { children: true, texture: true })
    }
  }, [])

  // Update vehicles from backend data
  useEffect(() => {
    if (!appRef.current || !lanesContainerRef.current.length) return

    const app = appRef.current

    // Remove vehicles that no longer exist
    Object.keys(vehicleSpritesRef.current).forEach(vehicleId => {
      if (!vehicles.find(v => v.id === vehicleId)) {
        vehicleSpritesRef.current[vehicleId].destroy()
        delete vehicleSpritesRef.current[vehicleId]
        delete vehicleTargetsRef.current[vehicleId]
      }
    })

    // Add or update vehicles
    vehicles.forEach(vehicle => {
      const laneIndex = vehicle.laneId === 'replica-1' ? 0 : vehicle.laneId === 'replica-2' ? 1 : 2
      const targetPosition = vehicle.position * LANE_WIDTH

      if (!vehicleSpritesRef.current[vehicle.id]) {
        // Create new vehicle sprite
        const vehicleSprite = createVehicleSprite(vehicle.type)
        vehicleSprite.x = 0 // Start at beginning

        if (lanesContainerRef.current[laneIndex]) {
          lanesContainerRef.current[laneIndex].addChild(vehicleSprite)
          vehicleSpritesRef.current[vehicle.id] = vehicleSprite
        }
      }

      // Update target position (animation loop will smoothly move to it)
      vehicleTargetsRef.current[vehicle.id] = targetPosition
    })
  }, [vehicles])

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

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 glass rounded-lg px-4 py-2 z-10">
        <div className="text-xs text-redhat-text-secondary">Highway Traffic</div>
        <div className="text-lg font-semibold text-white">
          {vehicles?.length || 0} vehicles
        </div>
      </div>
      <div ref={canvasRef} className="rounded-lg overflow-hidden" />
    </div>
  )
}

export default Highway
