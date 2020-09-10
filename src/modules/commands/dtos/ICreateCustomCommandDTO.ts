export default interface ICreateCustomCommandDTO {
  server_id: string;
  category_id: string;
  enabled: boolean;
  show_in_menu: boolean;
  name: string;
  description: string;
  title: string;
  content?: string;
  image_content?: string;
  image_thumbnail?: string;
  embedded?: boolean;
  color?: string;
  footer_text?: string;
  role_limited?: boolean;
  role_blacklist?: string;
  role_whitelist?: string;
  channel_limited?: boolean;
  channel_blacklist?: string;
  channel_whitelist?: string;
  updated_by?: string;
}
