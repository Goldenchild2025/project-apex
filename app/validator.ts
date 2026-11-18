export interface FilmValidationInput {
  title: string
  description: string
  videoUrl: string
}

export interface ValidationResult {
  isValid: boolean
  errors: {
    title?: string
    description?: string
    videoUrl?: string
  }
}

export function validateFilmInput(input: FilmValidationInput): ValidationResult {
  const errors: ValidationResult['errors'] = {}

  const trimmedTitle = input.title?.trim() || ''
  if (!trimmedTitle) {
    errors.title = 'Film title is required.'
  } else if (trimmedTitle.length < 2) {
    errors.title = 'Film title must be at least 2 characters long.'
  } else if (trimmedTitle.length > 100) {
    errors.title = 'Film title cannot exceed 100 characters.'
  }

  const trimmedDesc = input.description?.trim() || ''
  if (!trimmedDesc) {
    errors.description = 'Description is required.'
  } else if (trimmedDesc.length < 10) {
    errors.description = 'Description must be at least 10 characters long.'
  } else if (trimmedDesc.length > 500) {
    errors.description = 'Description cannot exceed 500 characters.'
  }

  const trimmedUrl = input.videoUrl?.trim() || ''
  if (!trimmedUrl) {
    errors.videoUrl = 'Video URL is required.'
  } else {
    try {
      const parsedUrl = new URL(trimmedUrl)
      const hostname = parsedUrl.hostname.toLowerCase()

      const allowedDomains = [
        'youtube.com',
        'www.youtube.com',
        'youtu.be',
        'vimeo.com',
        'www.vimeo.com',
        'player.vimeo.com',
      ]

      const isAllowedDomain = allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
      const hasVideoExtension = /\.(mp4|webm|mov|m4v)$/i.test(parsedUrl.pathname)

      if (!isAllowedDomain && !hasVideoExtension) {
        errors.videoUrl = 'Please provide a valid YouTube, Vimeo, or direct video file URL (.mp4, .webm, .mov).'
      }
    } catch {
      errors.videoUrl = 'Invalid URL format. Please include https://'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}