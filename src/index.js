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
        window.onbeforeunload = () =>{
            let dataString = JSON.stringify(this.todoList)

            var AVTodos = AV.Object.extend('AllTodos')
            var avTodos = new AVTodos()
            avTodos.set('content', dataString)
            avTodos.save().then(function (todo) {
                console.log("保存成功")
            }, function (error) {
                console.error("保存失败")
            })

        }
        
        // let oldDataString = window.localStorage.getItem('myTodos')
        // let oldData = JSON.parse(oldDataString)
        // this.todoList = oldData || []

        this.currentUser = this.getCurrentUser()

    },
    methods: {
        addTodo: function(){
            this.todoList.push({
                title: this.newTodo,
                createdAt: new Date(),
                done: false
            })
            this.newTodo = "" //input 框变成空的
        },
        removeTodo: function(todo){
            let index = this.todoList.indexOf(todo)
            this.todoList.splice(index,1)
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
            })
        },
        logIn: function(){
            AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => {
                this.currentUser = this.getCurrentUser()
                console.log(this.currentUser)
            }, (error) => {
                alert('登录失败')
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