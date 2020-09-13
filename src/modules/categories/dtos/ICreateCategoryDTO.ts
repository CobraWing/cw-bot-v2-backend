export default interface ICreateCategoryDTO {
  server_id: string;
  name: string;
  description: string;
  enabled: boolean;
  show_in_menu: boolean;
  updated_by: string;
}
