import React, { Component } from 'react'
import HttpErrorHandler from '../../library/HttpErrorHandler'
import Axios from 'axios'

import HostListTable from './HostListTable'
import Api from '../../library/Api'
import Pagination from '../common/Pagination'
import ListPageHeader from '../common/ListPageHeader'
import Loading from '../common/Loading'


export default class HostList extends Component {
    constructor(props) {
        super(props);
        let search = new URLSearchParams(props.location.search)
        this.page = search.get("page") || 1
        this.state = {
            hosts: [],
            loading: true,
            currentPage: 1,
            totalPages: 0,
            filter: search.get("filter") || ""
        }
    }

    loadData(page, filter) {
        const fieldList = Api.Hosts.ListFields.join(",")
        this.setState({
            loading: true
        })
        Axios.get(`/api/v1/hosts/?_page=${page}&_filter=${filter}&_fields=${fieldList}`).then((response) => {
            var hostList = response.data.data
            this.setState({
                hosts: hostList,
                loading: false,
                currentPage: response.data.page,
                totalPages: response.data.total_pages,
            });
        })
        .catch(HttpErrorHandler)
    }

    componentDidMount() {
        this.loadData(this.page, this.state.filter)
    }

    handlePageChanged(page) {
        this.page = page
        this.loadData(this.page, this.state.filter)
        this.props.history.push({ 'search': `page=${this.page}&filter=${this.state.filter}` })
    }

    handleFilterChanged(filter) {
        this.setState({
            filter: filter
        })
        this.loadData(this.page, filter)
        this.props.history.push({ 'search': `page=${this.page}&filter=${filter}` })
    }

    render() {
        let includeDescription = true
        return (
            <div>
                <ListPageHeader title="Host List" 
                                onFilterChanged={this.handleFilterChanged.bind(this)} 
                                filter={this.state.filter} 
                                createButtonText="Add Host(s)" 
                                createLink="/hosts/new" />
                { 
                    this.state.loading ? <div className="max vertcenter"><Loading /></div> :
                        <HostListTable hosts={this.state.hosts} includeDescription={includeDescription} />
                }
                <Pagination className="text-center" current={this.state.currentPage} total={this.state.totalPages} onChangePage={this.handlePageChanged.bind(this)} />
            </div>
        )
    }
}