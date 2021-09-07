import Vue from 'vue'
//导入提示框组件Message等
import { Button, Form, FormItem, Input, Message} from 'element-ui'
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
//Message需要配置到Vue原型属性中
Vue.prototype.$message = Message
