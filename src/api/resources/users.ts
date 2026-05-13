import { apiClient } from "@/api/client";
import type { operations } from "@/types/api";

export type User =
  operations["getUserById"]["responses"][200]["content"]["application/json"];
export type Users =
  operations["getUsers"]["responses"][200]["content"]["application/json"];
export type CreateUserInput =
  operations["createUser"]["requestBody"]["content"]["application/json"];
export type UpdateUserInput =
  operations["updateUser"]["requestBody"]["content"]["application/json"];

export async function getUsers(): Promise<Users> {
  const response = await apiClient.get<Users>("/users");

  return response.data;
}

export async function getUserById(id: string): Promise<User> {
  const response = await apiClient.get<User>(`/users/${id}`);

  return response.data;
}

export async function createUser(data: CreateUserInput): Promise<User> {
  const response = await apiClient.post<User>("/users", data);

  return response.data;
}

export async function updateUser(
  id: string,
  data: UpdateUserInput,
): Promise<User> {
  const response = await apiClient.patch<User>(`/users/${id}`, data);

  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
