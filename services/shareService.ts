import { Avatar, MashResults } from '../types';
import { SPONSOR } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// --- Placeholder Functions ---
const submitToChallenge = (entryId: string) => {
  // In a real app, this would send the entry ID to a backend server.
  console.log(`Submitting entry ${entryId} to the weekly challenge.`);
};

const logAnalytics = (eventName: string, eventData: object) => {
  // In a real app, this would send analytics data to a service like Google Analytics.
  console.log(`Logging analytics event: ${eventName}`, eventData);
};
// --- End Placeholder Functions ---

// Helper to convert Base64 to a File object for the Web Share API
async function base64ToFile(base64: string, filename: string, mimeType: string): Promise<File> {
    const res = await fetch(`data:${mimeType};base64,${base64}`);
    const blob = await res.blob();
    return new File([blob], filename, { type: mimeType });
}

export const handleShare = async (
  avatar: Avatar,
  results: MashResults,
  story: string,
  openModalFallback: () => void
): Promise<boolean> => {
  const isMobile = /Mobi/i.test(window.navigator.userAgent);
  const shareText = `My MASH future: ${results.Housing} + ${results.Car}! Predict yours @MASHmania #MASHmaniaFuture Powered by ${SPONSOR.tag}`;
  
  // Use Web Share API on mobile if available
  if (navigator.share && isMobile) {
    try {
      const imageFile = await base64ToFile(avatar.base64Image, 'mash-portrait.png', 'image/png');
      await navigator.share({
        title: 'My 90s M.A.S.H. Future!',
        text: shareText,
        files: [imageFile],
      });
      
      const entryId = uuidv4(); // Generate a unique ID for the entry
      submitToChallenge(entryId);
      logAnalytics('share_success', { platform: 'native' });
      return true; // Indicate success
    } catch (error) {
      console.error('Error using Web Share API:', error);
      logAnalytics('share_native_error', { error });
      // If the user cancels the share, we don't open the modal.
      if ((error as DOMException).name !== '