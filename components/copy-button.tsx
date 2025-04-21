"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Copy } from "lucide-react"
import { useState } from "react"

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function CopyButton({
  text,
  label = "Copy",
  className,
  variant = "default",
  size = "default",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "The content has been copied to your clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={handleCopy} variant={variant} size={size} className={className}>
      <Copy className="mr-2 h-4 w-4" /> {copied ? "Copied!" : label}
    </Button>
  )
}
