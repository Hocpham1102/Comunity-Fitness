'use client'

import { useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoPlayerProps {
  readonly videoUrl: string | null
  readonly thumbnailUrl: string | null
  readonly exerciseName: string
}

export default function VideoPlayer({ videoUrl, thumbnailUrl, exerciseName }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const getYouTubeEmbedUrl = (url: string) => {
    // Extract video ID from various YouTube URL formats
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = regex.exec(url)
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`
    }
    return null
  }

  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      <div className="aspect-video w-full">
        {embedUrl && isPlaying ? (
          <iframe
            src={embedUrl}
            title={`${exerciseName} - Exercise Video`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={`${exerciseName} thumbnail`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🏋️</div>
                <p className="text-lg">{exerciseName}</p>
                <p className="text-sm">No video available</p>
              </div>
            )}
            
            {embedUrl && (
              <Button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {isPlaying && embedUrl && (
        <Button
          onClick={() => setIsPlaying(false)}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
          size="sm"
        >
          <Pause className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
