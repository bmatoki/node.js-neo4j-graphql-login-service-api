CREATE (m:ManagementUser {
     id: apoc.create.uuid(),
     created_date: apoc.date.format(timestamp()),
     username: "superuser",
     password: "d5e1cba37084c06d5f21bd6a994d901e",
     role: "superuser",
     title: "superuser",
     full_name: "superuser",
     locked: false,
     suspended_time: "",
     fail_attempt_count: 0
    })
    RETURN m


