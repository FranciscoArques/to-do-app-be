export interface FriendsDTO {
  filteredUserDTO: FilteredUserDTO;
  filteredUsersDTO: FilteredUsersDTO;
}

export type FilteredUserDTO = {
  id: string;
  name: string;
  lastConnection: string;
};

export type FilteredUsersDTO = {
  users: FilteredUserDTO[] | [];
};
