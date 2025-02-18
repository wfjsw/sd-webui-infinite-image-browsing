<script setup lang="ts">
import { getImageGenerationInfo } from '@/api'
import type { FileNodeInfo } from '@/api/files'
import { useGlobalStore } from '@/store/useGlobalStore'
import { useLocalStorage } from '@vueuse/core'
import type { MenuInfo } from 'ant-design-vue/lib/menu/src/interface'
import { debounce } from 'lodash-es'
import { computed, watch } from 'vue'
import { ref } from 'vue'
import { copy2clipboardI18n } from '@/util'
import { useResizeAndDrag } from './useResize'
import {
  DragOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  StarFilled,
  StarOutlined
} from '@/icon'
import { t } from '@/i18n'
import { getImageSelectedCustomTag, type Tag } from '@/api/db'
import { createReactiveQueue } from '@/util'

const global = useGlobalStore()
const el = ref<HTMLElement>()
const props = defineProps<{
  file: FileNodeInfo
  idx: number
}>()
const selectedTag = ref([] as Tag[])
const tags = computed(() => {
  return (global.conf?.all_custom_tags ?? []).reduce((p, c) => {
    return [...p, { ...c, selected: !!selectedTag.value.find((v) => v.id === c.id) }]
  }, [] as (Tag & { selected: boolean })[])
})
const q = createReactiveQueue()
const imageGenInfo = ref('')
const emit = defineEmits<{
  (type: 'contextMenuClick', e: MenuInfo, file: FileNodeInfo, idx: number): void
}>()

watch(
  () => props?.file?.fullpath,
  async (path) => {
    if (!path) {
      return
    }
    q.tasks.forEach((v) => v.cancel())
    q.pushAction(() => getImageGenerationInfo(path)).res.then((v) => {
      imageGenInfo.value = v
    })
  },
  { immediate: true }
)
const onMouseHoverContext = (show: boolean) => {
  if (!show) {
    return
  }
  q.pushAction(() => getImageSelectedCustomTag(props.file.fullpath)).res.then((res) => {
    selectedTag.value = res
  })
}

const resizeHandle = ref<HTMLElement>()
const dragHandle = ref<HTMLElement>()
const state = useLocalStorage('fullScreenContextMenu.vue-drag', {
  left: 100,
  top: 100,
  width: 512,
  height: 384,
  expanded: true
})
useResizeAndDrag(el, resizeHandle, dragHandle, {
  ...state.value,
  onDrag: debounce(function (left, top) {
    state.value = {
      ...state.value,
      left,
      top
    }
  }, 300),
  onResize: debounce(function (width, height) {
    state.value = {
      ...state.value,
      width,
      height
    }
  }, 300)
})

function todiv(p: any) {
  return p.parentNode as HTMLDivElement
}
</script>

<template>
  <div
    ref="el"
    class="full-screen-menu"
    @wheel.capture.stop
    :class="{ 'unset-size': !state.expanded }"
  >
    <div class="container">
      <div class="actoion-bar">
        <div ref="dragHandle" class="icon" style="cursor: grab">
          <DragOutlined />
        </div>
        <div class="icon" style="cursor: pointer" @click="state.expanded = !state.expanded">
          <FullscreenExitOutlined v-if="state.expanded" />
          <FullscreenOutlined v-else />
        </div>
        <template v-if="state.expanded">
          <div flex-placeholder></div>
          <a-dropdown
            :trigger="['hover']"
            style="z-index: 99999"
            :get-popup-container="(p) => todiv(p)"
            @visible-change="onMouseHoverContext"
          >
            <a-button>{{ t('openContextMenu') }}</a-button>
            <template #overlay>
              <a-menu @click="emit('contextMenuClick', $event, file, idx)" style="z-index: 99999">
                <a-menu-item key="deleteFiles">{{ $t('deleteSelected') }}</a-menu-item>
                <a-menu-item key="send2txt2img">{{ $t('sendToTxt2img') }}</a-menu-item>
                <a-menu-item key="send2img2img">{{ $t('sendToImg2img') }}</a-menu-item>
                <a-menu-item key="send2inpaint">{{ $t('sendToInpaint') }}</a-menu-item>
                <a-menu-item key="send2extras">{{ $t('sendToExtraFeatures') }}</a-menu-item>
                <a-menu-item key="send2savedDir">{{ $t('send2savedDir') }}</a-menu-item>
                <a-sub-menu key="toggle-tag" :title="$t('toggleTag')">
                  <a-menu-item v-for="tag in tags" :key="tag.id"
                    >{{ tag.name }} <star-filled v-if="tag.selected" /><star-outlined v-else />
                  </a-menu-item>
                </a-sub-menu>
              </a-menu>
            </template>
          </a-dropdown>
          <a-button @click="copy2clipboardI18n(imageGenInfo)">{{
            $t('copyPrompt')
          }}</a-button>
        </template>
      </div>
      <div class="gen-info" v-if="state.expanded">
        {{ imageGenInfo }}
      </div>
    </div>

    <div class="mouse-sensor" ref="resizeHandle" v-if="state.expanded" />
  </div>
</template>

<style scoped lang="scss">
.full-screen-menu {
  position: fixed;
  z-index: 99999;
  background: var(--zp-primary-background);
  padding: 16px;
  box-shadow: 0px 0px 4px var(--zp-secondary);
  border-radius: 4px;

  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .gen-info {
    padding-top: 8px;
    flex: 1;
    word-break: break-all;
    white-space: pre-line;
    overflow: auto;
    z-index: 1;
    position: relative;
  }

  &.unset-size {
    width: unset !important;
    height: unset !important;
  }

  .mouse-sensor {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background-color: var(--zp-secondary);
    cursor: se-resize;
  }

  .actoion-bar {
    display: flex;
    align-items: center;

    .icon {
      font-size: 1.5em;
    }

    & > * {
      margin-right: 8px;
    }
  }
}
</style>
