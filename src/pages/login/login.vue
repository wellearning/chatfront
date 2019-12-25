<template>
  <div>
    <el-container>
      <el-main>
        <el-row class="login" :gutter="0" type="flex" align="middle">
          <el-col :xs="2" :sm="4" :md="6" :lg="8" :xl="9">&#12288;</el-col>
          <el-col :xs="20" :sm="16" :md="12" :lg="8" :xl="6">
            <div class="loginBox">
              <h2 class="loginTitle">Welcom to Chatin Memo</h2>
              <el-form class="loginForm" ref="loginForm" :model="loginForm" :rules="loginFormRules" @keyup.13.native="login()">
                <el-form-item label prop="username">
                  <el-input v-model.trim="loginForm.username" placeholder="Account"></el-input>
                </el-form-item>
                <el-form-item label prop="password">
                  <el-input v-model.trim="loginForm.password" placeholder="Password" type="password"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button class="loginBtn" type="primary" @click="login()" :loading="isLoading">Enter</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-col>
          <el-col :xs="2" :sm="4" :md="6" :lg="8" :xl="9">&#12288;</el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  data: function () {
    // let verifyPw = (rule, value, callback) => {
    //   let reg = /^[a-zA-Z0-9]{6,12}$/
    //   if (!reg.test(value)) {
    //     callback(new Error('密码为6-12位且只能包含字母、数字'))
    //   } else {
    //     callback()
    //   }
    // }
    return {
      isLoading: false,
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRules: {
        username: [
          { required: true, message: 'Please Enter Your Account Number', trigger: 'blur' }
        ],
        password: [
          // { validator: verifyPw, trigger: 'blur' },
          { required: true, message: 'Please Enter Your Password', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 登录
    login: function () {
      this.$refs['loginForm'].validate(valid => {
        if (valid) {
          // todo: 登录接口
          // this.isLoading = true
          // this.axios.get('/api/?username=' + this.form.username + '&password=' + this.form.password).then(res => {
          //   console.log('登录', res)
          //   this.$store.dispatch('asynSetAccount', this.form.username)
          //   this.$store.dispatch('asynSetToken', res.data.data.access_token)
          //   this.$message({
          //     type: 'success',
          //     message: 'Login Successful',
          //     duration: 1000
          //   })
          //   this.initPermissionList()
          //   this.isLoading = false
          // }).catch(err => {
          //   console.log('登录出错', err)
          //   this.isLoading = false
          // })
          this.$store.dispatch('asynSetAccount', 'administrator')
          this.$store.dispatch('asynSetToken', 'tempToken')
          this.$message({
            type: 'success',
            message: 'Login Successful',
            duration: 1000
          })
          let arr = [
            {
              id: 1,
              path: '/',
              name: 'Index',
              componentPath: 'pages/index/index',
              redirect: '/home',
              children: [
                {
                  id: 11,
                  path: '/home',
                  name: 'Home',
                  componentPath: 'pages/index/Home/home'
                }, {
                  id: 12,
                  path: '/configure',
                  name: 'Configure',
                  componentPath: 'pages/index/Configure/configure',
                  redirect: '/organization',
                  children: [
                    {
                      id: 121,
                      path: '/organization',
                      name: 'Organization',
                      componentPath: 'pages/index/Configure/organization'
                    }, {
                      id: 122,
                      path: '/user',
                      name: 'User',
                      componentPath: 'pages/index/Configure/user'
                    }, {
                      id: 123,
                      path: '/role',
                      name: 'Role',
                      componentPath: 'pages/index/Configure/role'
                    }, {
                      id: 124,
                      path: '/insuranceCompany',
                      name: 'Insurance Company',
                      componentPath: 'pages/index/Configure/insuranceCompany'
                    }
                  ]
                }, {
                  id: 13,
                  path: '/memoDesign',
                  name: 'Memo Design',
                  componentPath: 'pages/index/Memo Design/memoDesign',
                  redirect: '/questions',
                  children: [
                    {
                      id: 131,
                      path: '/questions',
                      name: 'Questions',
                      componentPath: 'pages/index/Memo Design/questions/questions',
                      redirect: '/reminders',
                      children: [
                        {
                          id: 1311,
                          path: '/reminders',
                          name: 'Reminders',
                          componentPath: 'pages/index/Memo Design/questions/reminders'
                        }, {
                          id: 1312,
                          path: '/properties',
                          name: 'Properties',
                          componentPath: 'pages/index/Memo Design/questions/properties'
                        }, {
                          id: 1313,
                          path: '/choiceQuestion',
                          name: 'Choice Question',
                          componentPath: 'pages/index/Memo Design/questions/choiceQuestion'
                        }, {
                          id: 1314,
                          path: '/fillInQuestion',
                          name: 'Fill In Question',
                          componentPath: 'pages/index/Memo Design/questions/fillInQuestion'
                        }, {
                          id: 1315,
                          path: '/simpleAnswer',
                          name: 'Simple Answer',
                          componentPath: 'pages/index/Memo Design/questions/simpleAnswer'
                        }
                      ]
                    }, {
                      id: 132,
                      path: '/blocks',
                      name: 'Blocks',
                      componentPath: 'pages/index/Memo Design/blocks/blocks'
                    }, {
                      id: 133,
                      path: '/templates',
                      name: 'Templates',
                      componentPath: 'pages/index/Memo Design/templates/templates'
                    }
                  ]
                }, {
                  id: 14,
                  path: '/memo',
                  name: 'Memo',
                  componentPath: 'pages/index/Memo/memo',
                  redirect: '/newMemo',
                  children: [
                    {
                      id: 141,
                      path: '/newMemo',
                      name: 'New Memo',
                      componentPath: 'pages/index/Memo/newMemo'
                    }, {
                      id: 142,
                      path: '/myMemoes',
                      name: 'My Memoes',
                      componentPath: 'pages/index/Memo/myMemoes'
                    }, {
                      id: 143,
                      path: '/memoes',
                      name: 'Memoes',
                      componentPath: 'pages/index/Memo/memoes'
                    }
                  ]
                }
              ]
            }
          ]
          this.$store.dispatch('asynSetPermissionList', JSON.stringify(arr))
          this.$router.addRoutes(this.translateTree(arr))
          this.$router.push({ path: '/' })
        }
      })
    },
    // todo: 权限
    // // 初始化菜单
    // initPermissionList: function () {
    //   this.isLoading = true
    //   this.axios.get('/api/tack/home/user/info').then(res => {
    //     if (res.data.error === '0') {
    //       this.initTree(res.data.data.rolePermission.isAdmin, res.data.data.rolePermission.menuList)
    //     }
    //   }).catch(err => {
    //     console.log('初始化菜单出错', err)
    //   })
    // },
    // // 权限树（菜单树）
    // initTree: function (isAdmin, list) {
    //   this.axios.get('/api/tack/menu/tree').then(res => {
    //     if (res.data.error === '0') {
    //       let tree = this.editTree(res.data.data.children, isAdmin, list)
    //       this.$store.dispatch('asynSetPermissionList', JSON.stringify(tree))
    //       this.$router.addRoutes(this.translateTree(tree))
    //       this.$router.push({ path: '/home' })
    //     }
    //   }).catch(err => {
    //     console.log('权限树（菜单树）出错', err)
    //   })
    // },
    // // 递归遍历树，删除无权限节点
    // editTree: function (arr, isAdmin, list) {
    //   for (let i = arr.length - 1; i >= 0; i--) {
    //     arr[i].name = arr[i].extra.name
    //     arr[i].path = arr[i].extra.path
    //     arr[i].componentPath = arr[i].extra.componentPath
    //     if (!isAdmin && list.indexOf(parseInt(arr[i].id)) === -1) {
    //       arr.splice(i, 1)
    //       continue
    //     }
    //     if (arr[i].children.length > 0) {
    //       this.editTree(arr[i].children, isAdmin, list)
    //     }
    //   }
    //   return arr
    // },
    // 递归遍历树
    translateTree: function (arr) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].componentPath !== undefined) {
          arr[i].component = resolve => require(['@/' + arr[i].componentPath + ''], resolve)
          if (arr[i].children !== undefined && arr[i].children.length > 0) {
            this.translateTree(arr[i].children)
          }
        }
      }
      return arr
    }
  }
}
</script>

<style scoped>

</style>
