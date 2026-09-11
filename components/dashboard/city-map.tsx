"use client"

import { useEffect, useRef } from "react"
import type { Employee } from "@/lib/types"
import { groupBy } from "@/lib/data"
import { CITY_COORDS } from "@/lib/cities"
import { Card, CardHeader } from "@/components/ui/primitives"

export function CityMap({ data }: { data: Employee[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const layerRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    async function init() {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")
      if (cancelled || !ref.current) return

      if (!mapRef.current) {
        mapRef.current = L.map(ref.current, {
          center: [22.5, 79],
          zoom: 4,
          scrollWheelZoom: false,
          attributionControl: false,
        })
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          { maxZoom: 19 },
        ).addTo(mapRef.current)
      }

      if (layerRef.current) {
        mapRef.current.removeLayer(layerRef.current)
      }
      const group = L.layerGroup()

      const stats = groupBy(data, (e) => e.city ?? "Unknown").filter(
        (s) => CITY_COORDS[s.key],
      )
      const maxTotal = Math.max(1, ...stats.map((s) => s.total))

      for (const s of stats) {
        const [lat, lng] = CITY_COORDS[s.key]
        const radius = 10 + (s.total / maxTotal) * 26
        const high = s.rate >= 0.4
        const color = high ? "#e5484d" : "#2dd4bf"
        L.circleMarker([lat, lng], {
          radius,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.35,
        })
          .bindPopup(
            `<strong>${s.key}</strong><br/>Headcount: ${s.total}<br/>Attrition: ${s.left} (${(s.rate * 100).toFixed(1)}%)`,
          )
          .bindTooltip(`${s.key} · ${(s.rate * 100).toFixed(0)}%`, {
            direction: "top",
          })
          .addTo(group)
      }

      group.addTo(mapRef.current)
      layerRef.current = group
      setTimeout(() => mapRef.current?.invalidateSize(), 100)
    }
    init()
    return () => {
      cancelled = true
    }
  }, [data])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <Card className="animate-in">
      <CardHeader
        title="Geographic Attrition Map"
        subtitle="Bubble size = headcount · red = high-attrition city (≥40%)"
      />
      <div className="p-4">
        <div
          ref={ref}
          className="h-80 w-full overflow-hidden rounded-lg border border-border"
        />
      </div>
    </Card>
  )
}
