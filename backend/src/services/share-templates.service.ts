import { pgPool } from '../config/database';

export interface ShareTemplate {
  id: number;
  contentType: string;
  platform: string;
  template: string;
  variables: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ShareTemplatesService {
  // Default templates for different content types and platforms
  private static readonly DEFAULT_TEMPLATES = {
    post: {
      facebook: "Check out this amazing post! 🎉\n\n{title}\n\n{url}\n\n#YourApp #Social",
      twitter: "Just saw this awesome post! {title} {url} #YourApp",
      whatsapp: "Hey! Check out this post: {title}\n\n{url}",
      linkedin: "Interesting post I came across: {title}\n\n{description}\n\n{url}",
      instagram: "📸 Amazing content! {title} {url} #YourApp #Share"
    },
    profile: {
      facebook: "Meet {name}! 👋\n\n{description}\n\nCheck out their profile: {url}\n\n#YourApp #Networking",
      twitter: "Great to connect with {name}! {bio} {url} #YourApp",
      whatsapp: "Check out {name}'s profile: {name} - {bio}\n\n{url}",
      linkedin: "Great connecting with {name}! {bio} {url} #Networking #YourApp",
      instagram: "👥 Meet {name}! {bio} {url} #YourApp #Community"
    },
    event: {
      facebook: "🎉 Don't miss this event!\n\n{title}\n\n📅 {date}\n📍 {location}\n\n{description}\n\n{url}\n\n#Events #YourApp",
      twitter: "Exciting event coming up! {title} on {date} at {location} {url} #Events #YourApp",
      whatsapp: "Hey! There's an amazing event you should check out:\n\n{title}\n📅 {date}\n📍 {location}\n\n{url}",
      linkedin: "Professional event alert! {title} - {date} at {location}. {description} {url} #Networking #Events",
      instagram: "📅 Event alert! {title} happening {date} at {location} {url} #Events #YourApp"
    },
    product: {
      facebook: "🛍️ Great find!\n\n{title}\n\n💰 {price}\n\n{description}\n\n{url}\n\n#Shopping #YourApp",
      twitter: "Awesome deal! {title} for just {price} {url} #Shopping #YourApp",
      whatsapp: "Check out this amazing product:\n\n{title}\n💰 {price}\n\n{url}",
      linkedin: "Interesting product: {title} - {price}. {description} {url} #Business #Shopping",
      instagram: "🛒 Must-have item! {title} - {price} {url} #Shopping #YourApp"
    }
  };

  // Get template for content type and platform
  static async getTemplate(
    contentType: string,
    platform: string,
    customTemplate?: string
  ): Promise<string> {
    // Check for custom template first
    if (customTemplate) {
      return customTemplate;
    }

    // Check database for custom templates
    const dbTemplate = await this.getCustomTemplate(contentType, platform);
    if (dbTemplate) {
      return dbTemplate.template;
    }

    // Return default template
    return this.getDefaultTemplate(contentType, platform);
  }

  // Get custom template from database
  static async getCustomTemplate(contentType: string, platform: string): Promise<ShareTemplate | null> {
    const query = `
      SELECT id, content_type, platform, template, variables, is_default, created_at, updated_at
      FROM share_templates
      WHERE content_type = $1 AND platform = $2 AND is_default = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pgPool.query(query, [contentType, platform]);
    return result.rows[0] || null;
  }

  // Get default template
  static getDefaultTemplate(contentType: string, platform: string): string {
    const contentTemplates = this.DEFAULT_TEMPLATES[contentType as keyof typeof this.DEFAULT_TEMPLATES];
    if (!contentTemplates) {
      return "Check this out! {url} #YourApp";
    }

    return contentTemplates[platform as keyof typeof contentTemplates] || contentTemplates.facebook;
  }

  // Create custom template
  static async createTemplate(
    contentType: string,
    platform: string,
    template: string,
    variables: string[] = [],
    isDefault: boolean = false
  ): Promise<ShareTemplate> {
    const query = `
      INSERT INTO share_templates (content_type, platform, template, variables, is_default, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, content_type, platform, template, variables, is_default, created_at, updated_at
    `;

    const result = await pgPool.query(query, [
      contentType,
      platform,
      template,
      JSON.stringify(variables),
      isDefault
    ]);

    return result.rows[0];
  }

  // Update template
  static async updateTemplate(
    templateId: number,
    updates: Partial<Pick<ShareTemplate, 'template' | 'variables' | 'isDefault'>>
  ): Promise<ShareTemplate> {
    const setParts = [];
    const params = [];
    let paramIndex = 1;

    if (updates.template !== undefined) {
      setParts.push(`template = $${paramIndex}`);
      params.push(updates.template);
      paramIndex++;
    }

    if (updates.variables !== undefined) {
      setParts.push(`variables = $${paramIndex}`);
      params.push(JSON.stringify(updates.variables));
      paramIndex++;
    }

    if (updates.isDefault !== undefined) {
      setParts.push(`is_default = $${paramIndex}`);
      params.push(updates.isDefault);
      paramIndex++;
    }

    setParts.push(`updated_at = NOW()`);

    const query = `
      UPDATE share_templates
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, content_type, platform, template, variables, is_default, created_at, updated_at
    `;

    params.push(templateId);

    const result = await pgPool.query(query, params);
    return result.rows[0];
  }

  // Get all templates
  static async getAllTemplates(): Promise<ShareTemplate[]> {
    const query = `
      SELECT id, content_type, platform, template, variables, is_default, created_at, updated_at
      FROM share_templates
      ORDER BY content_type, platform, created_at DESC
    `;

    const result = await pgPool.query(query);
    return result.rows.map(row => ({
      ...row,
      variables: JSON.parse(row.variables)
    }));
  }

  // Delete template
  static async deleteTemplate(templateId: number): Promise<void> {
    const query = `DELETE FROM share_templates WHERE id = $1`;
    await pgPool.query(query, [templateId]);
  }

  // Render template with variables
  static renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;

    // Replace variables in template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      rendered = rendered.replace(regex, variables[key] || '');
    });

    return rendered;
  }

  // Generate share message for content
  static async generateShareMessage(
    contentType: string,
    contentId: string,
    platform: string,
    contentData: any,
    customTemplate?: string
  ): Promise<string> {
    const template = await this.getTemplate(contentType, platform, customTemplate);

    // Prepare variables based on content type
    const variables = this.prepareVariables(contentType, contentData);

    return this.renderTemplate(template, variables);
  }

  // Prepare variables for template rendering
  private static prepareVariables(contentType: string, contentData: any): Record<string, any> {
    const baseVariables = {
      url: contentData.shareUrl || contentData.url || '',
      title: contentData.title || contentData.name || '',
      description: contentData.description || contentData.caption || '',
      name: contentData.name || contentData.title || '',
      date: contentData.date || contentData.eventDate || '',
      location: contentData.location || '',
      price: contentData.price ? `$${contentData.price}` : '',
      bio: contentData.bio || contentData.description || '',
      tags: contentData.tags ? contentData.tags.join(' ') : ''
    };

    // Add content-type specific variables
    switch (contentType) {
      case 'post':
        return {
          ...baseVariables,
          author: contentData.author?.name || contentData.user?.name || '',
          likes: contentData.likesCount || 0,
          comments: contentData.commentsCount || 0
        };

      case 'profile':
        return {
          ...baseVariables,
          followers: contentData.followersCount || 0,
          posts: contentData.postsCount || 0,
          faculty: contentData.faculty || ''
        };

      case 'event':
        return {
          ...baseVariables,
          attendees: contentData.currentAttendees || 0,
          capacity: contentData.maxAttendees || 0,
          organizer: contentData.organizer?.name || ''
        };

      case 'product':
        return {
          ...baseVariables,
          condition: contentData.condition || '',
          category: contentData.category || '',
          seller: contentData.seller?.name || ''
        };

      default:
        return baseVariables;
    }
  }

  // Initialize default templates in database
  static async initializeDefaultTemplates(): Promise<void> {
    for (const [contentType, platforms] of Object.entries(this.DEFAULT_TEMPLATES)) {
      for (const [platform, template] of Object.entries(platforms)) {
        // Extract variables from template
        const variables = this.extractVariablesFromTemplate(template);

        // Check if template already exists
        const existing = await this.getCustomTemplate(contentType, platform);
        if (!existing) {
          await this.createTemplate(contentType, platform, template, variables, true);
        }
      }
    }
  }

  // Extract variables from template string
  private static extractVariablesFromTemplate(template: string): string[] {
    const variableRegex = /{(\w+)}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }
}

export default ShareTemplatesService;