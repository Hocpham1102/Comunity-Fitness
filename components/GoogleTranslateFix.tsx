'use client';

import { useEffect } from 'react';

/**
 * Hook to prevent Google Translate from crashing React by modifying DOM nodes
 * that React is trying to remove.
 * It observes the DOM for `font` or `span` tags inserted by Google Translate
 * and prevents React from throwing NotFoundError.
 */
export function GoogleTranslateFix() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Save the original removeChild method
    const originalRemoveChild = Node.prototype.removeChild;

    // Override the removeChild method to catch the specific error
    // @ts-ignore
    Node.prototype.removeChild = function (child: Node) {
      if (child.parentNode !== this) {
        if (console) {
          console.warn(
            'Caught a Failed to execute removeChild on Node error. ' +
              'This is likely due to Google Translate modifying the DOM.'
          );
        }
        return child; // Silently fail and return the child
      }
      return originalRemoveChild.call(this, child);
    };

    // Save the original insertBefore method
    const originalInsertBefore = Node.prototype.insertBefore;

    // Override the insertBefore method to catch similar errors
    // @ts-ignore
    Node.prototype.insertBefore = function (newNode: Node, referenceNode: Node | null) {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (console) {
          console.warn(
            'Caught a Failed to execute insertBefore on Node error. ' +
              'This is likely due to Google Translate modifying the DOM.'
          );
        }
        return newNode; // Silently fail
      }
      return originalInsertBefore.call(this, newNode, referenceNode);
    };

    return () => {
      // Restore the original methods when the component unmounts
      Node.prototype.removeChild = originalRemoveChild;
      Node.prototype.insertBefore = originalInsertBefore;
    };
  }, []);

  return null;
}
