import type { FileNodeInfo } from './files'
import { axiosInst } from './index'

export interface Tag {
  name: string
  id: number
  display_name: string | null
  type: string
  count: number
}

export type DataBaseBasicInfo = {
  img_count: number
  tags: Tag[]
  expired: boolean
  expired_dirs: string[]
}

export const getDbBasicInfo = async () => {
  const resp = await axiosInst.get('/db/basic_info')
  return resp.data as DataBaseBasicInfo
}

export const getExpiredDirs = async () => {
  const resp = await axiosInst.get('/db/expired_dirs')
  return resp.data as Pick<DataBaseBasicInfo, 'expired' | 'expired_dirs'>
}


export const updateImageData = async () => {
  await axiosInst.post('/db/update_image_data', {}, { timeout: Infinity })
}

export interface MatchImageByTagsReq {
  and_tags: number[]
  or_tags: number[]
  not_tags: number[]
}

export const getImagesByTags = async (req: MatchImageByTagsReq) => {
  const resp = await axiosInst.post('/db/match_images_by_tags', req)
  return resp.data as FileNodeInfo[]
}

export const addCustomTag = async (req: { tag_name: string }) => {
  const resp = await axiosInst.post('/db/add_custom_tag', req)
  return resp.data as Tag
}

export const toggleCustomTagToImg = async (req: { tag_id: number; img_path: string }) => {
  const resp = await axiosInst.post('/db/toggle_custom_tag_to_img', req)
  return resp.data as { is_remove: boolean }
}

export const removeCustomTag = async (req: { tag_id: number }) => {
  await axiosInst.post('/db/remove_custom_tag', req)
}

export const removeCustomTagToImg = async (req: { tag_id: number; img_id: number }) => {
  await axiosInst.post('/db/add_custom_tag_from_img', req)
}

export const getImageSelectedCustomTag = async (path: string) => {
  const resp = await axiosInst.get('/db/img_selected_custom_tag', { params: { path } })
  return resp.data as Tag[]
}
