<!-- VideoArea：视频区域（右侧，摄像头在上，弹幕/聊天在下） -->
<template>
  <div class="videoArea">
    <!-- 摄像头区域（上方，小一点） -->
    <div class="cameraBox">
      <div class="videoPlaceholder">
        <div class="videoLabel">摄像头</div>
        <div class="videoHint">视频区域</div>
      </div>
    </div>

    <!-- 弹幕/聊天区域（下方，占一块区域） -->
    <div class="chatBox">
      <div class="chatPlaceholder">
        <div class="chatLabel">弹幕/聊天</div>
        <div class="chatHint">互动区域</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 视频区域组件，目前为占位显示
// 后续可以接入真实的视频流和聊天功能
</script>

<style scoped>
.videoArea {
  display: flex;
  flex-direction: column;
  gap: var(--base-spacing-md);
  height: 100%;
}

.cameraBox {
  flex: 0 0 30%;
  min-height: 150px;
  background: #000;
  border-radius: var(--base-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(59, 130, 246, 0.3);
}

.chatBox {
  flex: 1;
  min-height: 200px;
  background: #1a1a1a;
  border-radius: var(--base-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.videoPlaceholder,
.chatPlaceholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--base-spacing-sm);
  color: rgba(255, 255, 255, 0.5);
}

.videoLabel,
.chatLabel {
  font-size: var(--base-font-size-md);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.videoHint,
.chatHint {
  font-size: var(--base-font-size-sm);
  color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 767.98px) {
  .videoArea {
    gap: var(--base-spacing-sm);
  }

  .cameraBox {
    flex: 0 0 25%;
    min-height: 120px;
  }

  .chatBox {
    min-height: 150px;
  }
}
</style>

