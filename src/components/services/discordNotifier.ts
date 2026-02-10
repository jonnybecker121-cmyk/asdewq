/**
 * Discord Webhook Integration für Bewegungs-Log Benachrichtigungen
 */

import type { InventoryLogEntry } from '../store/inventoryStore';

export interface DiscordWebhookSettings {
  enabled: boolean;
  webhookUrl: string;
  notifyOnManual: boolean;
  notifyOnApiCheck: boolean;
  notifyOnMovementDetected: boolean;
  minChangeThreshold: number; // Nur benachrichtigen bei Änderungen >= diesem Wert
}

class DiscordNotifier {
  /**
   * Sendet eine Discord Benachrichtigung für einen Bewegungs-Log Eintrag
   */
  async sendInventoryNotification(
    logEntry: InventoryLogEntry,
    settings: DiscordWebhookSettings
  ): Promise<boolean> {
    // Prüfe ob Benachrichtigungen aktiviert sind
    if (!settings.enabled || !settings.webhookUrl) {
      return false;
    }

    // Prüfe ob dieser Log-Typ benachrichtigt werden soll
    if (
      (logEntry.type === 'manual' && !settings.notifyOnManual) ||
      (logEntry.type === 'api_check' && !settings.notifyOnApiCheck) ||
      (logEntry.type === 'movement_detected' && !settings.notifyOnMovementDetected)
    ) {
      return false;
    }

    // Prüfe Schwellenwert
    const absoluteChange = Math.abs(logEntry.change);
    if (absoluteChange < settings.minChangeThreshold) {
      return false;
    }

    try {
      // Erstelle Discord Embed Message
      const embed = this.createEmbed(logEntry);

      // Sende an Discord Webhook
      const response = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'SCHMELZDEPOT Inventory',
          avatar_url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=200&h=200&fit=crop',
          embeds: [embed],
        }),
      });

      if (!response.ok) {
        console.error('[Discord] Webhook failed:', response.status, response.statusText);
        return false;
      }

      console.log(`✅ [Discord] Notification sent for ${logEntry.item}`);
      return true;
    } catch (error) {
      console.error('[Discord] Error sending notification:', error);
      return false;
    }
  }

  /**
   * Erstellt ein Discord Embed für einen Log-Eintrag
   */
  private createEmbed(logEntry: InventoryLogEntry): any {
    // Farbe basierend auf Änderungstyp
    let color = 0x808080; // Grau für neutral
    if (logEntry.change > 0) {
      color = 0x00ff00; // Grün für Zunahme
    } else if (logEntry.change < 0) {
      color = 0xff0000; // Rot für Abnahme
    }

    // Icon basierend auf Typ
    const typeEmoji = {
      manual: '✏️',
      api_check: '🔄',
      movement_detected: '🚨',
    }[logEntry.type] || '📦';

    // Kategorie Icon
    const categoryEmoji = {
      gold: '🥇',
      silver: '🥈',
      item: '📦',
      maschine: '⚙️',
    }[logEntry.category] || '📦';

    // Typ-Beschreibung
    const typeDescription = {
      manual: 'Manuelle Änderung',
      api_check: 'API-Prüfung',
      movement_detected: '⚠️ Bewegung erkannt',
    }[logEntry.type] || logEntry.type;

    // Kategorie-Beschreibung
    const categoryDescription = {
      gold: 'Gold',
      silver: 'Silber',
      item: 'Artikel',
      maschine: 'Maschine',
    }[logEntry.category] || logEntry.category;

    return {
      title: `${typeEmoji} ${typeDescription}`,
      description: logEntry.details || '',
      color: color,
      fields: [
        {
          name: '📦 Artikel',
          value: `${categoryEmoji} ${logEntry.item}`,
          inline: true,
        },
        {
          name: '📊 Kategorie',
          value: categoryDescription,
          inline: true,
        },
        {
          name: '\u200B', // Empty field for line break
          value: '\u200B',
          inline: false,
        },
        {
          name: '📉 Vorher',
          value: `${logEntry.previousQuantity}`,
          inline: true,
        },
        {
          name: logEntry.change > 0 ? '📈 Änderung' : '📉 Änderung',
          value: logEntry.change > 0 ? `+${logEntry.change}` : `${logEntry.change}`,
          inline: true,
        },
        {
          name: '📊 Nachher',
          value: `${logEntry.newQuantity}`,
          inline: true,
        },
      ],
      timestamp: logEntry.timestamp,
      footer: {
        text: 'SCHMELZDEPOT Business Management System',
      },
    };
  }

  /**
   * Sendet eine Test-Benachrichtigung
   */
  async sendTestNotification(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'SCHMELZDEPOT Inventory',
          avatar_url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=200&h=200&fit=crop',
          embeds: [
            {
              title: '✅ Discord Integration aktiviert',
              description: 'Die Discord-Benachrichtigungen wurden erfolgreich eingerichtet!',
              color: 0xff8000, // Orange (#ff8000)
              fields: [
                {
                  name: '📦 System',
                  value: 'SCHMELZDEPOT Business Management',
                  inline: true,
                },
                {
                  name: '🔔 Funktion',
                  value: 'Bewegungs-Log Benachrichtigungen',
                  inline: true,
                },
              ],
              timestamp: new Date().toISOString(),
              footer: {
                text: 'Test-Benachrichtigung',
              },
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('[Discord] Test notification failed:', error);
      return false;
    }
  }
}

export const discordNotifier = new DiscordNotifier();
