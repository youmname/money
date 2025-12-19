<!-- DataTable：通用表格组件（表头 + 行渲染）
  用途：学生列表 / 排课列表等通用数据表格
  Props：
    - columns: Array<{ key, title, width? }>（必填）列定义
    - rows: Array<any>（必填）数据行数组
    - rowKey: string（可选，默认 'id'）每行唯一标识字段名
  Slots：
    - cell-xxx：自定义列单元格渲染（例如 cell-actions）
      - 作用域插槽参数：{ row, value }
  行为：
    - 默认能渲染字符串/数字
    - 行 hover 高亮（不改变布局）
-->
<template>
    <div class="dataTable">
      <table class="dataTable__table">
        <!-- 可选列宽 -->
        <colgroup>
          <col
            v-for="col in columns"
            :key="col.key"
            :style="col.width ? { width: col.width } : {}"
          />
        </colgroup>
  
        <!-- 表头 -->
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" class="dataTable__th">
              {{ col.title }}
            </th>
          </tr>
        </thead>
  
        <!-- 行 -->
        <tbody>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="getRowKey(row, rowIndex)"
            class="dataTable__row"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="dataTable__td"
            >
              <!-- 可选自定义插槽 cell-xxx -->
              <slot
                :name="`cell-${col.key}`"
                :row="row"
                :value="row[col.key]"
              >
                {{ formatCell(row[col.key]) }}
              </slot>
            </td>
          </tr>
  
          <!-- 无数据时简单占位（后续可对接 EmptyState） -->
          <tr v-if="!rows || rows.length === 0">
            <td :colspan="columns.length" class="dataTable__empty">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  // ==========================
  // DataTable：最小可用通用表格
  // ==========================
  
  const props = defineProps({
    columns: {
      type: Array,
      default: () => []
    },
    rows: {
      type: Array,
      default: () => []
    },
    rowKey: {
      type: String,
      default: 'id'
    }
  })
  
  function getRowKey(row, index) {
    const key = row?.[props.rowKey]
    return key != null ? key : index
  }
  
  // 默认单元格渲染：字符串/数字直接展示，其他类型转为 JSON 或空字符串
  function formatCell(value) {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string' || typeof value === 'number') return value
    try {
      return JSON.stringify(value)
    } catch {
      return ''
    }
  }
  </script>
  
  <style scoped>
  /* 引入设计令牌（CSS 变量） */
  @import '@/assets/base-tokens.css';
  
  /* 外层容器：有轻微磨砂和圆角，匹配整体 UI */
  .dataTable {
    width: 100%;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 14px 40px rgba(17, 45, 120, 0.08);
    overflow: hidden;
  }
  
  /* 表格基础样式 */
  .dataTable__table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: var(--base-font-size-md);
  }
  
  /* 表头单元格 */
  .dataTable__th {
    text-align: left;
    padding: 12px 16px;
    background: linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.96));
    color: rgba(15, 23, 42, 0.82);
    font-weight: 600;
    border-bottom: 1px solid rgba(148, 163, 184, 0.25);
    white-space: nowrap;
  }
  
  /* 单元格 */
  .dataTable__td {
    padding: 10px 16px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
    color: rgba(15, 23, 42, 0.92);
  }
  
  /* 行 hover 高亮 */
  .dataTable__row:hover {
    background: rgba(59, 130, 246, 0.04);
  }
  
  /* 无数据行 */
  .dataTable__empty {
    padding: 24px 16px;
    text-align: center;
    color: rgba(148, 163, 184, 1);
  }
  
  /* 最后一行不画底边框（美观一些） */
  .dataTable__row:last-of-type .dataTable__td {
    border-bottom-color: transparent;
  }
  
  /* 手机端：减小内边距，避免拥挤 */
  @media (max-width: 600px) {
    .dataTable__th,
    .dataTable__td {
      padding-inline: 10px;
    }
  }
  </style>