export const getTheme = (darkMode) => ({
  // Backgrounds
  pageBg: darkMode ? 'bg-black' : 'bg-gray-50',
  cardBg: darkMode ? 'bg-neutral-900' : 'bg-white',
  cardBorder: darkMode ? 'border-neutral-800' : 'border-gray-200',
  inputBg: darkMode ? 'bg-neutral-900' : 'bg-gray-100',
  inputBorder: darkMode ? 'border-neutral-800' : 'border-gray-300',
  inputText: darkMode ? 'text-white' : 'text-gray-900',
  inputPlaceholder: darkMode ? 'placeholder:text-neutral-700' : 'placeholder:text-gray-400',
  // Text
  textPrimary: darkMode ? 'text-neutral-100' : 'text-gray-900',
  textSecondary: darkMode ? 'text-neutral-400' : 'text-gray-500',
  textMuted: darkMode ? 'text-neutral-500' : 'text-gray-400',
  textLabel: darkMode ? 'text-neutral-600' : 'text-gray-400',
  // Camera area
  cameraBg: darkMode ? 'bg-neutral-900' : 'bg-gray-100',
  cameraBtnBg: darkMode ? 'bg-black' : 'bg-white',
  cameraBtnBorder: darkMode ? 'border-neutral-800' : 'border-gray-300',
  cameraBtnIcon: darkMode ? 'text-neutral-600' : 'text-gray-400',
  // Header badge
  badgeBg: darkMode ? 'bg-neutral-900' : 'bg-white',
  badgeBorder: darkMode ? 'border-neutral-800' : 'border-gray-200',
  badgeText: darkMode ? 'text-neutral-400' : 'text-gray-500',
  // Success page
  successBg: darkMode ? 'bg-neutral-950' : 'bg-gray-50',
  successCardBg: darkMode ? 'bg-neutral-900' : 'bg-white',
  successBtnBg: darkMode ? 'bg-white text-black' : 'bg-gray-900 text-white',
  // Error
  errorBg: darkMode ? 'bg-red-500/10' : 'bg-red-50',
  errorBorder: darkMode ? 'border-red-500/20' : 'border-red-200',
  errorText: darkMode ? 'text-red-400' : 'text-red-600',
  // Close button
  closeBg: darkMode ? 'bg-black/50' : 'bg-white/70',
  // Theme toggle
  toggleBg: darkMode ? 'bg-neutral-800' : 'bg-gray-200',
  toggleIcon: darkMode ? 'text-yellow-400' : 'text-indigo-600',
  // Retake
  retakeText: darkMode ? 'text-neutral-600' : 'text-gray-400',
  // Footer
  footerOpacity: darkMode ? 'opacity-30' : 'opacity-40',
  // Shutter border
  shutterBorder: darkMode ? 'border-white/10' : 'border-gray-300',
  shutterFill: darkMode ? 'bg-white' : 'bg-indigo-600',
  shutterIcon: darkMode ? 'text-black' : 'text-white',
});
