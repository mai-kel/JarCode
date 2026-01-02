export const mockUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  is_content_creator: true,
};

export const mockUserNonCreator = {
  id: 2,
  email: 'user@example.com',
  first_name: 'Regular',
  last_name: 'User',
  is_content_creator: false,
};

export const mockUsers = [mockUser, mockUserNonCreator];
