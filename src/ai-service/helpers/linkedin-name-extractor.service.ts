import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LinkedInNameExtractorService {
  private readonly logger = new Logger(LinkedInNameExtractorService.name);

  extractFromUrl(url: string): string {
    try {
      // Extract the LinkedIn username from the URL
      // LinkedIn URLs typically look like: https://linkedin.com/in/first-last-name-123456/
      const regex = /linkedin\.com\/in\/([^/?]+)/i;
      const match = url.match(regex);

      if (match && match[1]) {
        const username = match[1];

        // For usernames like "happyfelixchukwuma", try to split by capital letters or common patterns
        let cleanUsername = username
          .replace(/-\d+$/, '') // Remove trailing numbers like -123456
          .replace(/[^a-zA-Z-]/g, ''); // Keep only letters and hyphens

        // If no hyphens, try to split by capital letters (camelCase)
        if (!cleanUsername.includes('-')) {
          // Split by capital letters but keep them
          const parts = cleanUsername
            .split(/(?=[A-Z])/)
            .filter((part) => part.length > 0);

          if (parts.length >= 2) {
            cleanUsername = parts
              .slice(0, 2)
              .map(
                (part) =>
                  part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
              )
              .join(' ');
          } else if (parts.length === 1) {
            // Single word, capitalize it
            cleanUsername =
              parts[0].charAt(0).toUpperCase() +
              parts[0].slice(1).toLowerCase();
          }
        } else {
          // Has hyphens, split by hyphens
          cleanUsername = cleanUsername
            .split('-')
            .filter((part) => part.length > 1) // Keep parts with more than 1 character
            .slice(0, 2) // Take only first two parts (first and last name)
            .map(
              (part) =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
            )
            .join(' ');
        }

        // If we get a reasonable name, return it, otherwise return 'there'
        if (cleanUsername && cleanUsername.length > 2) {
          return cleanUsername;
        }
      }

      return 'there'; // Fallback if no name can be extracted
    } catch (error) {
      this.logger.error(
        'Failed to extract name from LinkedIn URL:',
        url,
        error,
      );
      return 'there'; // Safe fallback
    }
  }
}
