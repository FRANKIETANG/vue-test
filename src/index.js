import Vue from 'vue'
import AV from 'leancloud-storage'

var APP_ID = 'devR02x6sSIs1XSXezctBpzE-gzGzoHsz';
var APP_KEY = 't9sRMgGkMkmE6E9RPBfBPPfW';

AV.init({
    appId: APP_ID,
    appKey: APP_KEY
})

var app = new Vue({
    el: '#app',
    data: {
        formData: {
            username: '',
            password: ''
        },
        currentUser: null,
        actionType: 'signUp',
        newTodo: '',
        todoList: []
    },
    created: function() {

        // let oldDataString = window.localStorage.getItem('myTodos')
        // let oldData = JSON.parse(oldDataString)
        // this.todoList = oldData || []

        this.currentUser = this.getCurrentUser()

        this.fetchTodos()

    },
    methods: {
        fetchTodos: function(){
            if(this.currentUser){
                var query = new AV.Query('AllTodos')
                query.find().then((todos) => {
                    console.log(todos)
                    let avAllTodos = todos[0]
                    let id = avAllTodos.id
                    this.todoList = JSON.parse(avAllTodos.attributes.content)
                    this.todoList.id = id
                }, function(error){
                    console.error(error)
                })
            }
        },
        updateTodos: function(){
            let dataString = JSON.stringify(this.todoList)
            let avTodos = AV.Object.createWithoutData('AllTodos',this.todoList.id)
            avTodos.set('content', dataString)
            avTodos.save().then(() => {
                console.log('更新成功')
            })
        },
        saveTodos: function(){
            let dataString = JSON.stringify(this.todoList)
            var AVTodos = AV.Object.extend('AllTodos')
            var avTodos = new AVTodos()
            var acl = new AV.ACL()
            acl.setReadAccess(AV.User.current(),true)
            acl.setWriteAccess(AV.User.current(),true)
            avTodos.set('content', dataString)
            avTodos.setACL(acl)
            avTodos.save().then((todo) => {
                this.todoList.id = todo.id
                console.log('保存成功')
            }, function (error) {
                alert("保存失败")
            })
        },
        saveOrUpdateTodos: function(){
            if(this.todoList.id){
                this.updateTodos()
            }else{
                this.saveTodos()
            }
        },
        addTodo: function(){
            this.todoList.push({
                title: this.newTodo,
                createdAt: new Date(),
                done: false
            })
            this.newTodo = "" //input 框变成空的
            this.saveOrUpdateTodos()
        },
        removeTodo: function(todo){
            let index = this.todoList.indexOf(todo)
            this.todoList.splice(index,1)
            this.saveOrUpdateTodos()
        },
        signUp: function (){
            let user = new AV.User();
            user.setUsername(this.formData.username)
            user.setPassword(this.formData.password)
            user.signUp().then( (loginedUser) => {
                this.currentUser = this.getCurrentUser()
                console.log(this.currentUser)
            }, (error) => {
                alert('注册失败')
                console.log(error)
            })
        },
        logIn: function(){
            AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => {
                this.currentUser = this.getCurrentUser()
                this.fetchTodos()
                console.log(this.currentUser)
            }, (error) => {
                alert('登录失败')
                console.log(error)
            })                        
        },
        getCurrentUser: function(){
            let current = AV.User.current()
            if (current) {
                let {id, createdAt, attributes: {username}} = AV.User.current()
                return { id, username, createdAt }
            } else {
                return null
            }
        },
        logout: function(){
            AV.User.logOut()
            this.currentUser = null
            window.location.reload()//刷新当前页面资源
        }
    }
})