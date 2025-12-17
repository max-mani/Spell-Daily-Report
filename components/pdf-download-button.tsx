"use client"

import { useEffect, useState } from "react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export function PdfDownloadButton() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Check if we're on client side
    if (typeof window !== "undefined") {
      setIsReady(true)
      setError(null)
    }
  }, [])

  const rgbToHex = (rgb: string): string => {
    // Handle rgba/rgb format
    const matches = rgb.match(/\d+/g)
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0])
      const g = parseInt(matches[1])
      const b = parseInt(matches[2])
      return "#" + [r, g, b].map(x => {
        const hex = x.toString(16)
        return hex.length === 1 ? "0" + hex : hex
      }).join("")
    }
    return "#000000"
  }

  const convertColorToHex = (colorValue: string): string => {
    // If already hex, return as is
    if (colorValue.startsWith("#")) {
      return colorValue
    }
    
    // If rgb/rgba, convert to hex
    if (colorValue.startsWith("rgb")) {
      return rgbToHex(colorValue)
    }
    
    // For other formats (including lab, oklch, etc.), use a temp element to resolve
    try {
      const temp = document.createElement("div")
      temp.style.color = colorValue
      temp.style.position = "absolute"
      temp.style.visibility = "hidden"
      temp.style.opacity = "0"
      document.body.appendChild(temp)
      const resolvedColor = window.getComputedStyle(temp).color
      document.body.removeChild(temp)
      
      if (resolvedColor && resolvedColor.startsWith("rgb")) {
        return rgbToHex(resolvedColor)
      }
    } catch (e) {
      // Fallback to black if conversion fails
    }
    
    return "#000000"
  }

  const convertAllStylesToInline = (element: HTMLElement) => {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_ELEMENT,
      null
    )

    // Comprehensive list of CSS properties to convert
    const cssProperties = [
      // Layout
      'display',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'width',
      'height',
      'min-width',
      'min-height',
      'max-width',
      'max-height',
      'margin',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'box-sizing',
      'overflow',
      'overflow-x',
      'overflow-y',
      'z-index',
      
      // Flexbox
      'flex',
      'flex-direction',
      'flex-wrap',
      'flex-grow',
      'flex-shrink',
      'flex-basis',
      'justify-content',
      'align-items',
      'align-content',
      'align-self',
      'gap',
      'row-gap',
      'column-gap',
      
      // Grid
      'grid',
      'grid-template-columns',
      'grid-template-rows',
      'grid-template-areas',
      'grid-auto-columns',
      'grid-auto-rows',
      'grid-auto-flow',
      'grid-column',
      'grid-row',
      'grid-area',
      'grid-column-start',
      'grid-column-end',
      'grid-row-start',
      'grid-row-end',
      
      // Typography
      'font-family',
      'font-size',
      'font-weight',
      'font-style',
      'line-height',
      'text-align',
      'text-decoration',
      'text-transform',
      'letter-spacing',
      'word-spacing',
      'white-space',
      'text-overflow',
      
      // Colors and backgrounds
      'color',
      'background-color',
      'background',
      'background-image',
      'background-size',
      'background-position',
      'background-repeat',
      'opacity',
      
      // Borders
      'border',
      'border-width',
      'border-style',
      'border-color',
      'border-top',
      'border-right',
      'border-bottom',
      'border-left',
      'border-top-width',
      'border-right-width',
      'border-bottom-width',
      'border-left-width',
      'border-top-style',
      'border-right-style',
      'border-bottom-style',
      'border-left-style',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'border-radius',
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
      
      // Shadows
      'box-shadow',
      'text-shadow',
      
      // Transform
      'transform',
      'transform-origin',
      'translate',
      'translate-x',
      'translate-y',
      'scale',
      'rotate',
      
      // Other
      'visibility',
      'cursor',
      'pointer-events',
      'user-select',
      'object-fit',
      'object-position'
    ]

    let node: Node | null
    while ((node = walker.nextNode())) {
      const el = node as HTMLElement
      const computedStyle = window.getComputedStyle(el)
      
      try {
        // Convert all CSS properties to inline styles
        cssProperties.forEach(prop => {
          try {
            const value = computedStyle.getPropertyValue(prop)
            
            // Skip if value is empty or default/inherit/initial/unset
            if (!value || 
                value === 'initial' || 
                value === 'inherit' || 
                value === 'unset') {
              return
            }
            
            // Handle color property specially to ensure it's always set
            if (prop === 'color') {
              // Never skip color property - it's critical for text visibility
              if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent' && value !== 'currentcolor') {
                // Convert any color format to RGB/hex for better compatibility
                if (value.includes('lab(') || value.includes('oklch(') || value.includes('lch(')) {
                  const hexColor = convertColorToHex(value)
                  el.style.setProperty('color', hexColor, 'important')
                } else {
                  // Ensure color is set with !important
                  el.style.setProperty('color', value, 'important')
                }
              } else {
                // If color is transparent/currentcolor, set to computed color from parent or default to black
                const parentColor = el.parentElement ? window.getComputedStyle(el.parentElement).color : 'rgb(0, 0, 0)'
                if (parentColor && parentColor !== 'rgba(0, 0, 0, 0)' && parentColor !== 'transparent') {
                  el.style.setProperty('color', parentColor, 'important')
                } else {
                  el.style.setProperty('color', 'rgb(0, 0, 0)', 'important')
                }
              }
              return
            }
            
            // Skip transparent/zero colors for other color properties (but keep rgba(0,0,0,0) for borders)
            if (prop.includes('color') && 
                !prop.includes('border') &&
                (value === 'rgba(0, 0, 0, 0)' || 
                 value === 'transparent' || 
                 value === 'currentcolor')) {
              return
            }
            
            // Handle other color properties that might contain lab()/oklch()
            if (prop.includes('color') && (value.includes('lab(') || value.includes('oklch(') || value.includes('lch('))) {
              const hexColor = convertColorToHex(value)
              el.style.setProperty(prop, hexColor, 'important')
            } else {
              // For all other properties, set the computed value directly
              // Preserve all values including 'none', 'auto', 'normal' as they might be important
              el.style.setProperty(prop, value, 'important')
            }
          } catch (e) {
            // Ignore individual property errors
          }
        })
        
        // Handle special cases for shorthand properties
        try {
          // Handle border shorthand if it contains problematic colors
          const border = computedStyle.border
          if (border && border !== 'none' && border !== '0px none rgb(0, 0, 0)') {
            const borderColor = computedStyle.borderColor
            if (borderColor && (borderColor.includes('lab(') || borderColor.includes('oklch('))) {
              const borderWidth = computedStyle.borderWidth
              const borderStyle = computedStyle.borderStyle
              const hexColor = convertColorToHex(borderColor)
              el.style.setProperty('border', `${borderWidth} ${borderStyle} ${hexColor}`, 'important')
            }
          }
          
          // Handle background shorthand
          const background = computedStyle.background
          if (background && background !== 'none' && background !== 'rgba(0, 0, 0, 0)') {
            const bgColor = computedStyle.backgroundColor
            if (bgColor && (bgColor.includes('lab(') || bgColor.includes('oklch('))) {
              const hexColor = convertColorToHex(bgColor)
              el.style.setProperty('background-color', hexColor, 'important')
            }
          }
        } catch (e) {
          // Ignore shorthand property errors
        }
      } catch (e) {
        // Ignore errors for this element
      }
    }
  }

  const handleDownload = async () => {
    if (!isReady || isGenerating) {
      if (!isReady) {
        alert("PDF generator is loading, please try again in a moment.")
      }
      return
    }

    const element = document.getElementById("pdf-content")
    if (!element) {
      alert("Content not found. Please refresh the page.")
      return
    }

    setIsGenerating(true)

    let clonedElement: HTMLElement | null = null

    try {
      // Step 1: Clone the element with stylesheets still active
      clonedElement = element.cloneNode(true) as HTMLElement
      
      // Remove the download button from the clone
      // Find all buttons and check their text content
      const allButtons = clonedElement.querySelectorAll('button')
      allButtons.forEach(button => {
        const buttonText = button.textContent || ''
        if (buttonText.includes('Download PDF') || buttonText.includes('Generating PDF') || buttonText.includes('Loading')) {
          // Remove the button's parent container (the flex div wrapper)
          const parent = button.parentElement
          if (parent) {
            parent.remove()
          } else {
            button.remove()
          }
        }
      })
      
      // Remove any style tags from the cloned element
      const styleTags = clonedElement.querySelectorAll('style')
      styleTags.forEach(style => style.remove())
      
      // Position the clone absolutely but ensure it's visible for html2canvas
      // Place it at the same position as original but behind everything
      const rect = element.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(element)
      
      clonedElement.style.position = "fixed"
      clonedElement.style.left = rect.left + "px"
      clonedElement.style.top = rect.top + "px"
      // Use scrollWidth to capture full content width, including any overflow
      const fullWidth = Math.max(element.scrollWidth, element.offsetWidth, rect.width)
      clonedElement.style.width = fullWidth + "px"
      clonedElement.style.height = "auto"
      clonedElement.style.minHeight = Math.max(element.scrollHeight, element.offsetHeight, rect.height) + "px"
      clonedElement.style.maxWidth = "none"
      clonedElement.style.overflow = "visible"
      clonedElement.style.backgroundColor = computedStyle.backgroundColor || "#8c52ff"
      clonedElement.style.zIndex = "-9999"
      clonedElement.style.pointerEvents = "none"
      clonedElement.id = "pdf-content-clone"
      document.body.appendChild(clonedElement)
      
      // Force a reflow to ensure dimensions are calculated
      void clonedElement.offsetHeight
      
      // Step 2: Handle Next.js Image components
      // Next.js Image components render as <span> with <img> inside, or sometimes just <img>
      // We need to ensure all images are properly loaded and visible
      const allImages = clonedElement.querySelectorAll('img')
      const imagePromises = Array.from(allImages).map((img) => {
        return new Promise<void>((resolve) => {
          // Get the actual src
          let actualSrc = img.getAttribute('src') || 
                         img.getAttribute('data-src') || 
                         (img as HTMLImageElement).src
          
          // Handle relative paths
          if (actualSrc && actualSrc.startsWith('/')) {
            actualSrc = window.location.origin + actualSrc
          }
          
          if (actualSrc && img.src !== actualSrc) {
            img.src = actualSrc
          }
          
          // Ensure image is visible
          img.style.display = 'block'
          img.style.visibility = 'visible'
          img.style.opacity = '1'
          
          if (img.complete && img.naturalWidth > 0) {
            resolve()
          } else {
            img.onload = () => resolve()
            img.onerror = () => resolve() // Continue even if image fails
            setTimeout(() => resolve(), 3000) // Timeout after 3 seconds
          }
        })
      })
      
      await Promise.all(imagePromises)
      
      // Also handle Next.js Image wrapper spans that use background-image
      const imageSpans = clonedElement.querySelectorAll('span[style*="background-image"], span[style*="backgroundImage"]')
      imageSpans.forEach((span) => {
        const style = window.getComputedStyle(span)
        if (style.backgroundImage && style.backgroundImage !== 'none') {
          // Ensure the span is visible
          span.style.display = 'inline-block'
          span.style.visibility = 'visible'
        }
      })
      
      // Step 3: Wait for styles and images to fully load
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Step 4: Remove max-width constraints that might cut off content
      const allElements = clonedElement.querySelectorAll('*')
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        const computedStyle = window.getComputedStyle(htmlEl)
        if (computedStyle.maxWidth && computedStyle.maxWidth !== 'none') {
          // Only remove max-width if it's constraining the content
          const maxWidthValue = parseFloat(computedStyle.maxWidth)
          if (!isNaN(maxWidthValue) && maxWidthValue < clonedElement.scrollWidth) {
            htmlEl.style.maxWidth = 'none'
          }
        }
      })
      
      // Step 4b: Ensure accomplishments container and parent containers allow overflow
      const accomplishmentsContainer = clonedElement.querySelector('[class*="accomplishments"], [class*="overflow"]')
      if (accomplishmentsContainer) {
        const accEl = accomplishmentsContainer as HTMLElement
        accEl.style.overflow = 'visible'
        accEl.style.overflowX = 'visible'
        accEl.style.overflowY = 'visible'
      }
      
      // Find all containers that might need overflow visible
      const flexContainers = clonedElement.querySelectorAll('[class*="flex"]')
      flexContainers.forEach((container) => {
        const htmlContainer = container as HTMLElement
        const computedStyle = window.getComputedStyle(htmlContainer)
        // If container has absolutely positioned children that extend outside, make overflow visible
        const hasAbsoluteChildren = Array.from(htmlContainer.children).some((child) => {
          const childStyle = window.getComputedStyle(child as HTMLElement)
          return childStyle.position === 'absolute' || childStyle.position === 'fixed'
        })
        if (hasAbsoluteChildren && (computedStyle.overflow === 'hidden' || computedStyle.overflow === 'clip')) {
          htmlContainer.style.overflow = 'visible'
          htmlContainer.style.overflowX = 'visible'
          htmlContainer.style.overflowY = 'visible'
        }
      })
      
      // Step 5: Convert ALL computed styles to inline styles on the clone
      convertAllStylesToInline(clonedElement)
      
      // Step 5b: Explicitly ensure all text elements have color set
      const allTextElements = clonedElement.querySelectorAll('span, p, div, h1, h2, h3, h4, h5, h6, a, li, td, th')
      allTextElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        const computedStyle = window.getComputedStyle(htmlEl)
        const color = computedStyle.color
        
        // Always set color explicitly to ensure html2canvas captures it
        if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' && color !== 'currentcolor') {
          // Keep RGB/RGBA format as-is for better compatibility
          if (color.startsWith('rgb')) {
            htmlEl.style.setProperty('color', color, 'important')
          } else if (color.startsWith('#')) {
            // Already hex, use as-is
            htmlEl.style.setProperty('color', color, 'important')
          } else {
            // Convert other formats to hex
            const hexColor = convertColorToHex(color)
            htmlEl.style.setProperty('color', hexColor, 'important')
          }
        } else if (!color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent' || color === 'currentcolor') {
          // If no color or transparent, check parent or use black
          const parent = htmlEl.parentElement
          if (parent) {
            const parentColor = window.getComputedStyle(parent).color
            if (parentColor && parentColor !== 'rgba(0, 0, 0, 0)' && parentColor !== 'transparent') {
              htmlEl.style.setProperty('color', parentColor, 'important')
            } else {
              htmlEl.style.setProperty('color', 'rgb(0, 0, 0)', 'important')
            }
          } else {
            htmlEl.style.setProperty('color', 'rgb(0, 0, 0)', 'important')
          }
        }
      })
      
      // Step 6: Wait for inline styles to be applied and force a reflow
      await new Promise(resolve => setTimeout(resolve, 300))
      void clonedElement.offsetHeight

      // Verify element has content
      const finalRect = clonedElement.getBoundingClientRect()
      if (finalRect.width === 0 || finalRect.height === 0) {
        throw new Error("Cloned element has zero dimensions. PDF generation cannot proceed.")
      }

      // Step 7: Fix transforms and positioning for better PDF rendering
      // html2canvas sometimes has issues with CSS transforms, so we need to flatten them
      const flattenTransforms = (el: HTMLElement) => {
        const computedStyle = window.getComputedStyle(el)
        const transform = computedStyle.transform
        
        if (transform && transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
          // Get the element's final position after transform
          const rect = el.getBoundingClientRect()
          const parent = el.parentElement
          
          if (parent) {
            const parentRect = parent.getBoundingClientRect()
            const relativeLeft = rect.left - parentRect.left
            const relativeTop = rect.top - parentRect.top
            
            // Apply the transformed position directly
            if (el.style.position === 'absolute' || computedStyle.position === 'absolute') {
              el.style.position = 'absolute'
              el.style.left = relativeLeft + 'px'
              el.style.top = relativeTop + 'px'
              el.style.transform = 'none'
              el.style.margin = '0'
            }
          }
        }
      }
      
      // Apply transform flattening to all elements with transforms
      const allElementsWithTransforms = clonedElement.querySelectorAll('*')
      allElementsWithTransforms.forEach((el) => {
        const htmlEl = el as HTMLElement
        const computedStyle = window.getComputedStyle(htmlEl)
        if (computedStyle.transform && computedStyle.transform !== 'none') {
          flattenTransforms(htmlEl)
        }
      })
      
      // Step 7b: Ensure overflow is visible to capture negative positioned elements
      clonedElement.style.overflow = "visible"
      clonedElement.style.overflowX = "visible"
      clonedElement.style.overflowY = "visible"
      
      // Also ensure parent containers allow overflow, especially for accomplishments
      const allContainers = clonedElement.querySelectorAll('*')
      allContainers.forEach((container) => {
        const htmlContainer = container as HTMLElement
        const computedStyle = window.getComputedStyle(htmlContainer)
        // Check if this container has children positioned outside its bounds
        const hasNegativePositioned = Array.from(htmlContainer.children).some((child) => {
          const childEl = child as HTMLElement
          const childStyle = window.getComputedStyle(childEl)
          const childRect = childEl.getBoundingClientRect()
          const parentRect = htmlContainer.getBoundingClientRect()
          
          // Check if child extends outside parent bounds
          const extendsOutside = 
            childRect.left < parentRect.left ||
            childRect.right > parentRect.right ||
            childRect.top < parentRect.top ||
            childRect.bottom > parentRect.bottom
          
          return (childStyle.position === 'absolute' || childStyle.position === 'fixed') && extendsOutside
        })
        
        if (hasNegativePositioned || computedStyle.overflow === 'hidden' || computedStyle.overflow === 'clip') {
          htmlContainer.style.overflow = 'visible'
          htmlContainer.style.overflowX = 'visible'
          htmlContainer.style.overflowY = 'visible'
        }
      })
      
      // Recalculate to ensure we have the full dimensions
      await new Promise(resolve => setTimeout(resolve, 200))
      void clonedElement.offsetHeight
      
      // Step 8: Calculate full dimensions including overflow for canvas
      const canvasWidth = Math.max(
        clonedElement.scrollWidth,
        clonedElement.offsetWidth,
        clonedElement.getBoundingClientRect().width
      )
      const canvasHeight = Math.max(
        clonedElement.scrollHeight,
        clonedElement.offsetHeight,
        clonedElement.getBoundingClientRect().height
      )
      
      // Step 9: Use html2canvas to convert HTML to canvas
      // Explicitly set width and height to capture all content including overflow
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#8c52ff",
        allowTaint: false,
        width: canvasWidth,
        height: canvasHeight,
        windowWidth: canvasWidth,
        windowHeight: canvasHeight,
        // Let html2canvas calculate dimensions automatically to capture all content
        onclone: (clonedDoc, element) => {
          // Ensure all colors are properly set in the cloned document
          const clonedPdfContent = clonedDoc.getElementById("pdf-content-clone")
          if (clonedPdfContent) {
            // Ensure overflow is visible on main container
            clonedPdfContent.style.overflow = 'visible'
            clonedPdfContent.style.overflowX = 'visible'
            clonedPdfContent.style.overflowY = 'visible'
            
            // Ensure all colors are set
            const allTextElements = clonedPdfContent.querySelectorAll('span, p, div, h1, h2, h3, h4, h5, h6, a, li, td, th')
            allTextElements.forEach((el) => {
              const htmlEl = el as HTMLElement
              const computedStyle = clonedDoc.defaultView?.getComputedStyle(htmlEl)
              if (computedStyle) {
                const color = computedStyle.color
                if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' && color !== 'currentcolor') {
                  htmlEl.style.setProperty('color', color, 'important')
                }
              }
            })
            
            // Ensure all containers allow overflow to capture negative positioned elements
            const allContainers = clonedPdfContent.querySelectorAll('*')
            allContainers.forEach((container) => {
              const htmlContainer = container as HTMLElement
              const computedStyle = clonedDoc.defaultView?.getComputedStyle(htmlContainer)
              if (computedStyle) {
                // Make overflow visible for all containers
                if (computedStyle.overflow === 'hidden' || computedStyle.overflow === 'clip') {
                  htmlContainer.style.overflow = 'visible'
                }
                if (computedStyle.overflowX === 'hidden' || computedStyle.overflowX === 'clip') {
                  htmlContainer.style.overflowX = 'visible'
                }
                if (computedStyle.overflowY === 'hidden' || computedStyle.overflowY === 'clip') {
                  htmlContainer.style.overflowY = 'visible'
                }
              }
            })
          }
        },
      })

      // Step 8: Create PDF using jsPDF
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // A4 dimensions in inches
      const pdfWidth = 8.27 // inches
      const pdfHeight = 11.69 // inches
      const marginTopBottom = 0.3 // Top and bottom margins
      const marginLeftRight = 0.7 // Left and right margins - creates visible purple space on sides
      const contentWidth = pdfWidth - (marginLeftRight * 2)
      const contentHeight = pdfHeight - (marginTopBottom * 2)
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'a4',
        compress: true
      })

      // Use full width of the page (with minimal margins)
      const imgAspectRatio = imgWidth / imgHeight
      const finalWidth = contentWidth // Use full available width
      const finalHeight = finalWidth / imgAspectRatio

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/jpeg', 0.98)

      // Calculate how many pages we need
      const totalPages = Math.ceil(finalHeight / contentHeight)
      
      // Add image to PDF, splitting across pages if needed
      let yPosition = marginTopBottom
      let sourceY = 0
      const pageHeightInPixels = (contentHeight / finalHeight) * imgHeight

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage()
          yPosition = marginTopBottom
        }

        // Calculate the portion of the image for this page
        const remainingHeight = imgHeight - sourceY
        const pageSourceHeight = Math.min(pageHeightInPixels, remainingHeight)
        const pageDisplayHeight = (pageSourceHeight / imgHeight) * finalHeight

        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = imgWidth
        pageCanvas.height = pageSourceHeight
        const pageCtx = pageCanvas.getContext('2d')
        
        if (pageCtx) {
          // Draw the slice of the original canvas
          pageCtx.drawImage(
            canvas,
            0, sourceY, imgWidth, pageSourceHeight,
            0, 0, imgWidth, pageSourceHeight
          )
          
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98)
          // Use left margin for horizontal positioning
          pdf.addImage(pageImgData, 'JPEG', marginLeftRight, yPosition, finalWidth, pageDisplayHeight)
        }

        sourceY += pageSourceHeight
      }

      // Save the PDF
      pdf.save("report.pdf")
    } catch (err: any) {
      console.error("PDF generation error:", err)
      const errorMsg = err?.message || err?.toString() || "Unknown error occurred"
      alert(`Failed to generate PDF:\n${errorMsg}\n\nPlease check the browser console (F12) for more details.`)
    } finally {
      // Clean up cloned element
      if (clonedElement && clonedElement.parentNode) {
        clonedElement.parentNode.removeChild(clonedElement)
      }
      
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-center mb-4">
      {error && (
        <p className="text-red-500 text-sm mb-2 text-center max-w-md">{error}</p>
      )}
      <button
        onClick={handleDownload}
        disabled={!isReady || !!error || isGenerating}
        className={`bg-white text-[#8c52ff] px-6 py-3 rounded-[20px] shadow-[8px_8px_0px_rgba(0,0,0,0.2)] font-semibold text-lg hover:shadow-[6px_6px_0px_rgba(0,0,0,0.2)] transition-shadow ${
          !isReady || error || isGenerating ? "opacity-50 cursor-not-allowed" : ""
        }`}
        style={{ fontFamily: "Georgia, serif" }}
      >
        {isGenerating ? "Generating PDF..." : error ? "Error Loading" : isReady ? "Download PDF" : "Loading..."}
      </button>
    </div>
  )
}
