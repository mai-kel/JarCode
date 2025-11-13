<template>
    <Card>
      <template #title>
        <h2>Page Not Found</h2>
      </template>

      <template #content>
        <div class="p-fluid">
          <Message severity="warn" :closable="false">
            The page you requested doesn't exist.
          </Message>
        </div>
      </template>
    </Card>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

