import React, { Component } from 'react'
import HttpErrorHandler from '../../library/HttpErrorHandler'
import Axios from 'axios'

import ListPageHeader from '../common/ListPageHeader'
import GroupListTable from './GroupListTable'
import Pagination from '../common/Pagination'

export default class GroupList extends Component {
    constructor(props) {
        super(props);
        let search = new URLSearchParams(props.location.search)
        this.page = search.get("page") || 1
        this.state = {
            groups: [],
            loading: true,
            currentPage: 1,
            totalPages: 0,
            filter: search.get("filter") || "",
            selectedGroups: []
        }
    }

    loadData(page, filter) {
        Axios.get(`/api/v1/groups/?_page=${page}&_filter=${filter}&_fields=_id,name,description,project_name`).then((response) => {
            var groupList = response.data.data.map( item => { item.selected = false; return item });
            this.setState({
                groups: groupList,
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

    handleSelect(groupsToSelect) {
        var ind
        let {selectedGroups, groups} = this.state
        if (!(groupsToSelect instanceof Array)) { groupsToSelect = [groupsToSelect] }

        groupsToSelect.forEach(function(group) {
            ind = selectedGroups.indexOf(group)
            if (ind === -1) {
                selectedGroups.push(group)
                ind = groups.indexOf(group)
                groups[ind].selected = true
            }
        }, this);
        this.setState({ selectedGroups, groups })
    }

    handleDeselect(groupsToDeselect) {
        var ind
        let {selectedGroups, groups} = this.state
        if (!(groupsToDeselect instanceof Array)) { groupsToDeselect = [groupsToDeselect] }

        groupsToDeselect.forEach(function(group) {
            ind = selectedGroups.indexOf(group)
            if (ind !== -1) {
                selectedGroups.splice(ind, 1)
                ind = groups.indexOf(group)
                groups[ind].selected = false
            } 
        }, this);
        this.setState({ selectedGroups, groups })
    }

    render() {
        return (
            <div>
                <ListPageHeader title="Group List" 
                                onFilterChanged={this.handleFilterChanged.bind(this)} 
                                filter={this.state.filter} 
                                createButtonText="New Group" 
                                createLink="/groups/new" />
                { 
                    this.state.loading ? 'Loading' :
                        <GroupListTable onSelect={this.handleSelect.bind(this)} onDeselect={this.handleDeselect.bind(this)} groups={this.state.groups} />
                }
                <Pagination className="text-center" current={this.state.currentPage} total={this.state.totalPages} onChangePage={this.handlePageChanged.bind(this)} />
            </div>
        )
    }

}