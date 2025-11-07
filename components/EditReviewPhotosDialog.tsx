"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ReviewsService } from '@/lib/services/reviews.service'
import { useToast } from '@/hooks/use-toast'
import { X, Loader2 } from 'lucide-react'

interface EditReviewPhotosDialogProps {
  reviewId: number
  currentPhotos: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditReviewPhotosDialog({
  reviewId,
  currentPhotos,
  open,
  onOpenChange,
  onSuccess
}: EditReviewPhotosDialogProps) {
  const { toast } = useToast()
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + photoFiles.length + photoUrls.length > 6) {
      toast({ title: 'Límite de fotos', description: 'Máximo 6 fotos' })
      return
    }
    setPhotoFiles(prev => [...prev, ...files])
    e.target.value = ''
  }

  const handleUrlAdd = (url: string) => {
    if (!url.trim()) return
    
    try {
      new URL(url) // Validar URL
    } catch {
      toast({ title: 'URL inválida', description: 'Ingresá una URL válida' })
      return
    }
    
    if (photoFiles.length + photoUrls.length >= 6) {
      toast({ title: 'Límite de fotos', description: 'Máximo 6 fotos' })
      return
    }
    
    if (photoUrls.includes(url)) {
      toast({ title: 'Foto duplicada', description: 'Esa URL ya está en la lista' })
      return
    }
    
    setPhotoUrls(prev => [...prev, url])
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Subir archivos a Cloudinary
      let finalPhotos = [...photoUrls]
      
      if (photoFiles.length > 0) {
        setUploading(true)
        try {
          const uploadResult = await ReviewsService.uploadPhotos(photoFiles)
          finalPhotos = [...finalPhotos, ...uploadResult.photos.map(p => p.url)]
        } catch (uploadError: any) {
          toast({ 
            title: 'Error al subir fotos', 
            description: uploadError.message || 'No se pudieron subir las fotos',
            variant: 'destructive'
          })
          setUploading(false)
          setSaving(false)
          return
        } finally {
          setUploading(false)
        }
      }
      
      // Si no hay fotos nuevas, mantener las actuales
      if (finalPhotos.length === 0) {
        finalPhotos = [...currentPhotos]
      }
      
      // Actualizar la reseña
      await ReviewsService.updatePhotos(reviewId, finalPhotos)
      
      toast({ title: '✅ Fotos actualizadas', description: 'Las fotos se han actualizado correctamente' })
      onSuccess()
      onOpenChange(false)
      
      // Limpiar estado
      setPhotoFiles([])
      setPhotoUrls([])
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'No se pudieron actualizar las fotos',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setPhotoFiles([])
    setPhotoUrls([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar fotos de la reseña</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Fotos actuales */}
          {currentPhotos.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Fotos actuales</label>
              <div className="grid grid-cols-3 gap-2">
                {currentPhotos.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                    {url.includes('photos.app.goo.gl') ? (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center text-xs text-blue-600 p-2 text-center">
                        Google Photos
                      </div>
                    ) : (
                      <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Las nuevas fotos reemplazarán las actuales
              </p>
            </div>
          )}

          {/* Subir nuevas fotos */}
          <div>
            <label className="block text-sm font-medium mb-2">Nuevas fotos</label>
            
            {/* Input de archivos */}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
            />
            
            {/* Lista de archivos seleccionados */}
            {photoFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {photoFiles.map((file, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-blue-200 bg-blue-50">
                    <span className="max-w-[200px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setPhotoFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input de URL */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="O ingresá una URL (ej: Google Photos)"
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleUrlAdd(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  handleUrlAdd(input.value)
                  input.value = ''
                }}
              >
                Agregar URL
              </Button>
            </div>
            
            {/* Lista de URLs */}
            {photoUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photoUrls.map((url, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50">
                    <span className="max-w-[200px] truncate" title={url}>{url}</span>
                    <button
                      type="button"
                      onClick={() => setPhotoUrls(prev => prev.filter((_, i) => i !== idx))}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              {photoFiles.length + photoUrls.length} de 6 fotos seleccionadas
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading || saving}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={uploading || saving || (photoFiles.length === 0 && photoUrls.length === 0)}
            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

