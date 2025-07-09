# Responsive Design Guidelines

This document outlines the responsive design patterns used throughout the RaffleIt application.

## Screen Size Breakpoints

- **Mobile (default)**: 0-639px
- **Small (sm)**: 640px and up
- **Medium (md)**: 768px and up
- **Large (lg)**: 1024px and up
- **Extra Large (xl)**: 1280px and up

## Common Responsive Patterns

### Text Sizing
- `text-xs sm:text-sm` - Extra small to small
- `text-sm sm:text-base` - Small to base
- `text-base sm:text-lg` - Base to large
- `text-lg sm:text-xl` - Large to extra large
- `text-xl sm:text-2xl` - Extra large to 2xl
- `text-2xl sm:text-3xl` - 2xl to 3xl

### Spacing
- `px-4 sm:px-6 lg:px-8` - Responsive horizontal padding
- `py-4 sm:py-6 lg:py-8` - Responsive vertical padding
- `gap-4 sm:gap-6 lg:gap-8` - Responsive gap between elements
- `m-4 sm:m-6 lg:m-8` - Responsive margin

### Grid Systems
- `grid-cols-1 sm:grid-cols-2` - 1 column on mobile, 2 on small+
- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` - 1, 2, then 3 columns
- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` - 1, 2, 3, then 4 columns

### Flex Layouts
- `flex-col sm:flex-row` - Column on mobile, row on small+
- `gap-2 sm:gap-3 lg:gap-4` - Responsive gap in flex layouts

### Button Sizing
- `px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm` - Small buttons
- `px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base` - Regular buttons

### Container Widths
- `max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl` - Progressive max widths
- `max-w-4xl sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl` - Wide containers

### Icon Sizing
- `w-3 h-3 sm:w-4 sm:h-4` - Small icons
- `w-4 h-4 sm:w-5 sm:h-5` - Medium icons
- `w-5 h-5 sm:w-6 sm:h-6` - Large icons

### Image Heights
- `h-40 sm:h-48 lg:h-56` - Responsive image containers

### Visibility
- `hidden sm:block` - Hide on mobile, show on small+
- `block sm:hidden` - Show on mobile, hide on small+
- `hidden sm:inline` - Hide on mobile, show inline on small+
- `sm:hidden` - Hide on small screens and up

### Form Elements
- `px-3 py-2 text-sm sm:text-base` - Form inputs
- `text-sm sm:text-base` - Form labels

## Component-Specific Patterns

### RaffleCard
- Progressive image heights: `h-40 sm:h-48 lg:h-52`
- Responsive padding: `p-3 sm:p-4 lg:p-5`
- Adaptive text for buttons: Show full text on larger screens, abbreviated on mobile

### RaffleDetailsModal
- Responsive padding: `p-4 sm:p-6 lg:p-8`
- Adaptive grid layouts for statistics
- Progressive font sizes for headings

### PaymentOptions
- Stacked buttons on mobile, side-by-side on larger screens
- Responsive button text (show full text on sm+, abbreviated on mobile)

### Login/Register Forms
- Responsive form container padding
- Adaptive input sizing
- Progressive spacing between form elements

## Best Practices

1. **Mobile-First Design**: Always start with mobile styles and enhance for larger screens
2. **Progressive Enhancement**: Add features and spacing as screen size increases
3. **Consistent Breakpoints**: Use the same breakpoints across all components
4. **Readable Text**: Ensure text is legible at all screen sizes
5. **Touch-Friendly**: Ensure interactive elements are large enough for touch on mobile
6. **Performance**: Use responsive images and optimize for mobile loading

## Testing Responsive Design

Test the application at these common screen sizes:
- iPhone SE (375px)
- iPhone 12 Pro (390px)
- iPad (768px)
- Desktop (1024px)
- Large Desktop (1440px)

## Accessibility Considerations

- Ensure minimum touch target sizes (44px x 44px)
- Maintain proper color contrast at all sizes
- Test with screen readers at different zoom levels
- Ensure keyboard navigation works on all screen sizes
