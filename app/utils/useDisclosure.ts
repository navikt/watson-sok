import { useCallback, useState } from "react";

/**
 * Simple utility hook for managing the open state of something
 *
 * @param defaultOpen - Whether the component should be open by default
 * @returns An object with the following properties:
 * - isOpen: boolean - Whether the component is open
 * - onOpen: () => void - Function to open the component
 * - onClose: () => void - Function to close the component
 * - onToggle: () => void - Function to toggle the component
 */
export function useDisclosure(defaultOpen = false) {
  const [isOpen, setOpen] = useState(defaultOpen);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onToggle = useCallback(() => setOpen((prev) => !prev), []);
  return { isOpen, onOpen, onClose, onToggle };
}
