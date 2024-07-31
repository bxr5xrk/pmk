import { apiInstance } from "src/lib/api-instance";
import { Category, CreateStudentRes, GetStatRes, GetTestRes } from "src/types";

function getCategory(id: number, headers: object, host: string): Promise<Category[] | null> {
  return apiInstance<Category[]>({
    data: { id, "lang": 1 },
    headers,
    method: 'POST',
    name: 'getCategory',
    url: '/category',
    host
  })
}

async function createStudent(category: number, headers: object, host: string): Promise<CreateStudentRes | null> {
  return apiInstance({
    data: { category, "lang": 1, "name": "csd", "last_name": "csd", "group": "csd" },
    headers,
    method: 'POST',
    name: 'createStudent',
    url: '/createstudent',
    host
  })
}

async function getTest(headers: object, host: string): Promise<GetTestRes | null> {
  return apiInstance({
    data: {},
    headers,
    method: 'POST',
    name: 'getTest',
    url: '/gettest',
    host
  })
}

async function finish(headers: object, host: string) {
  return apiInstance({
    data: {},
    headers,
    method: 'POST',
    name: 'finish',
    url: '/finish',
    host
  })
}

async function stat(headers: object, host: string): Promise<GetStatRes | null> {
  return apiInstance({
    data: {},
    headers,
    method: 'POST',
    name: 'stat',
    url: '/Stat',
    host
  })
}


export const api = { getCategory, createStudent, getTest, finish, stat };