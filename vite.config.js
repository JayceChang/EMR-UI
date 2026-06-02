import {resolve} from 'path';
import {defineConfig, loadEnv} from 'vite';
import vue from '@vitejs/plugin-vue';
import customVariables from '/@/theme/custom-variables.js';
import fs from 'fs'
import path from 'path'
import vueJsx from '@vitejs/plugin-vue-jsx'

const pathResolve = (dir) => {
  return resolve(__dirname, '.', dir);
};

// 只读取项目根目录下的 HTML 文件（不包含子目录）
function getRootHtmlEntries() {
  const entries = {}
  const rootDir = process.cwd() // 项目根目录

  // 读取根目录下的所有文件（不递归子目录）
  const files = fs.readdirSync(rootDir, { withFileTypes: true })

  files.forEach(file => {
    // 只处理根目录下的 HTML 文件，跳过目录
    if (file.isFile() && path.extname(file.name) === '.html') {
      const fileName = path.basename(file.name, '.html') // 去掉 .html 后缀作为键名
      const fullPath = path.join(rootDir, file.name)
      entries[fileName] = fullPath
    }
  })

  return entries
}

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  // 根据模式设置 NODE_ENV
  const nodeEnv = mode === 'production' || mode === 'pre' ? 'production' : 'development';

  return {
    base: nodeEnv === 'production' ? '/' : '/',
    root: process.cwd(),
    resolve: {
      alias: [
        // 国际化替换
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
        },
        // 绝对路径重命名：/@/xxxx => src/xxxx
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/',
        },
        {
          find: /^~/,
          replacement: '',
        },
      ],
    },
    // 服务端渲染
    server: {
      host: '0.0.0.0',
      port: 8081,
      proxy: {
        '/test-api': {
          target: 'http://192.168.2.253:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/test-api/, ''),
        },
        '/api': {
          target: 'http://localhost:1024',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    plugins: [vue({
      template: {
        compilerOptions: {
          // 启用JSX/TSX解析插件
          parserPlugins: ['jsx', 'typescript'] // 若不用TS可只保留'jsx'
        }
      }
    }),
    vueJsx({
      // 可选：配置Vue JSX的特性（如支持Vue的指令语法）
      transformOn: true,
      mergeProps: true
    })],
    optimizeDeps: {
      include: ['ant-design-vue/es/locale/zh_CN', 'dayjs/locale/zh-cn', 'ant-design-vue/es/locale/en_US'],
      exclude: ['vue-demi'],
    },
    build: {
      // 清除console和debugger
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        // input: {
        //   main: 'index.html', // 默认入口
        //   report: 'report.html', // 独立页面入口
        //   reportQuery: 'report-query.html', // 独立页面入口
        // },
        input: getRootHtmlEntries(),
        output: {
          //配置这个是让不同类型文件放在不同文件夹，不会显得太乱
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            //静态资源分拆打包
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          },
        },
      },
      target: 'esnext',
      outDir: 'dist', // 指定输出路径
      assetsDir: 'assets', // 指定生成静态文件目录
      assetsInlineLimit: '4096', // 小于此阈值的导入或引用资源将内联为 base64 编码
      chunkSizeWarningLimit: 500, // chunk 大小警告的限制
      minify: 'terser', // 混淆器，terser构建后文件体积更小
      emptyOutDir: true, //打包前先清空原有打包文件
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: customVariables,
          javascriptEnabled: true,
        },
      },
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
      'process.env.VITE_APP_TITLE': JSON.stringify(env.VITE_APP_TITLE),
      'process.env.VITE_APP_API_URL': JSON.stringify(env.VITE_APP_API_URL),
    }
  };
});

