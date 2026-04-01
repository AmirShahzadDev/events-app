"use client"

import { router } from "@inertiajs/react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

type Flash = { success?: string; error?: string }

export function FlashToaster() {
  const lastRef = useRef<Flash>({})

  useEffect(() => {
    const off = router.on("success", (event) => {
      const flash = (event.detail.page.props as { flash?: Flash }).flash
      const success = flash?.success
      const error = flash?.error

      if (success && lastRef.current.success !== success) {
        toast.success(success)
      }
      if (error && lastRef.current.error !== error) {
        toast.error(error)
      }

      lastRef.current = { success, error }
    })

    return () => off()
  }, [])

  return null
}

