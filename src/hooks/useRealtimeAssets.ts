import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface RealtimeAssetCallbacks {
  onAssetUpdate?: (payload: any) => void
  onCommentAdded?: (payload: any) => void
  onTimelineEvent?: (payload: any) => void
}

export function useRealtimeAssets(callbacks: RealtimeAssetCallbacks) {
  const { toast } = useToast()

  useEffect(() => {
    const channel = supabase
      .channel('asset-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'assets'
        },
        (payload) => {
          console.log('Asset updated:', payload)
          callbacks.onAssetUpdate?.(payload)
          
          // Show toast for status changes
          if (payload.new.status !== payload.old.status) {
            toast({
              title: "Status Updated",
              description: `Asset "${payload.new.name}" is now ${payload.new.status}`,
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          console.log('Comment added:', payload)
          callbacks.onCommentAdded?.(payload)
          
          toast({
            title: "New Comment",
            description: `${payload.new.author_name} added a comment`,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'timeline_events'
        },
        (payload) => {
          console.log('Timeline event:', payload)
          callbacks.onTimelineEvent?.(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [callbacks, toast])
}
